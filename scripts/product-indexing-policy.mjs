const editorialFields = ["pros", "cons", "ideal_for", "not_for"];

function splitSentences(text) {
  return text.match(/[^.!?]+(?:[.!?]+|$)/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];
}

function editorialPoints(product, overrides) {
  const points = editorialFields.flatMap((field) => product.editorial?.[field] ?? []);
  const override = overrides?.[product.product_id];
  if (override) {
    points.push(...splitSentences(override.intro), ...splitSentences(override.detail));
  }
  return points;
}

function assertPolicy(policy) {
  if (policy.schema_version !== 1 || policy.scope !== "verified_product_detail_pages") {
    throw new Error("Product indexing policy has an unsupported schema or scope");
  }
  if (policy.default_decision !== "noindex") {
    throw new Error("Product indexing policy must fail closed with noindex");
  }
  const rules = policy.rules;
  if (!rules || typeof rules !== "object") throw new Error("Product indexing policy needs rules");
  if (!Number.isInteger(rules.frequent_editorial_reuse_threshold) || rules.frequent_editorial_reuse_threshold < 2) {
    throw new Error("Product indexing policy needs a valid repetition threshold");
  }
  if (!(rules.maximum_frequent_editorial_share_exclusive > 0 && rules.maximum_frequent_editorial_share_exclusive <= 1)) {
    throw new Error("Product indexing policy needs a valid repetition share");
  }
  if (!Number.isInteger(rules.minimum_unique_editorial_points) || rules.minimum_unique_editorial_points < 1) {
    throw new Error("Product indexing policy needs a positive unique-point threshold");
  }
  if (!Number.isInteger(rules.minimum_sources_for_substitution) || rules.minimum_sources_for_substitution < 2) {
    throw new Error("Product indexing policy needs a valid source substitution threshold");
  }
  if (!policy.manual_overrides || typeof policy.manual_overrides !== "object" || Array.isArray(policy.manual_overrides)) {
    throw new Error("Product indexing policy needs a manual_overrides object");
  }
}

function roundShare(value) {
  return Math.round(value * 10_000) / 10_000;
}

export function buildProductIndexing(products, policy, editorialOverrides = {}) {
  assertPolicy(policy);
  const verifiedProducts = products.filter((product) => product.status === "verified");
  const productIds = new Set(verifiedProducts.map((product) => product.product_id));
  const frequencies = new Map();

  for (const product of verifiedProducts) {
    for (const point of editorialPoints(product, editorialOverrides)) {
      frequencies.set(point, (frequencies.get(point) ?? 0) + 1);
    }
  }

  for (const [productId, override] of Object.entries(policy.manual_overrides)) {
    if (!productIds.has(productId)) throw new Error(`Product indexing override references unknown product ${productId}`);
    if (!override || !["index", "noindex"].includes(override.decision) || typeof override.reason !== "string" || override.reason.trim() === "") {
      throw new Error(`Product indexing override for ${productId} is incomplete`);
    }
  }

  const entries = verifiedProducts
    .map((product) => {
      const points = editorialPoints(product, editorialOverrides);
      const uniqueEditorialPoints = points.filter((point) => frequencies.get(point) === 1).length;
      const frequentEditorialPoints = points.filter(
        (point) => (frequencies.get(point) ?? 0) >= policy.rules.frequent_editorial_reuse_threshold,
      ).length;
      const frequentEditorialShare = roundShare(frequentEditorialPoints / Math.max(points.length, 1));
      const currentOfferCount = product.commercial.offers.length;
      const publishedSourceCount = product.sources.length;
      const distinctEvidence = uniqueEditorialPoints >= policy.rules.minimum_unique_editorial_points
        || (policy.rules.multiple_sources_can_substitute_unique_points
          && publishedSourceCount >= policy.rules.minimum_sources_for_substitution);
      const reasons = [];

      if (policy.rules.require_current_offer && currentOfferCount === 0) reasons.push("no-current-offer");
      if (policy.rules.require_published_source && publishedSourceCount === 0) reasons.push("no-published-source");
      if (frequentEditorialShare >= policy.rules.maximum_frequent_editorial_share_exclusive) reasons.push("high-editorial-repetition");
      if (!distinctEvidence) reasons.push("insufficient-distinct-evidence");

      const automaticDecision = reasons.length === 0 ? "index" : policy.default_decision;
      const override = policy.manual_overrides[product.product_id];
      const decision = override?.decision ?? automaticDecision;
      if (override) reasons.push(`manual-override: ${override.reason}`);
      if (decision === "index" && reasons.length === 0) {
        reasons.push(publishedSourceCount >= policy.rules.minimum_sources_for_substitution
          ? "distinct-editorial-or-multiple-sources"
          : "distinct-editorial-evidence");
      }

      return {
        product_id: product.product_id,
        decision,
        automatic_decision: automaticDecision,
        signals: {
          current_offer_count: currentOfferCount,
          published_source_count: publishedSourceCount,
          editorial_point_count: points.length,
          unique_editorial_point_count: uniqueEditorialPoints,
          frequent_editorial_point_count: frequentEditorialPoints,
          frequent_editorial_share: frequentEditorialShare
        },
        reasons
      };
    })
    .sort((a, b) => a.product_id.localeCompare(b.product_id));

  const indexableIds = new Set(entries.filter((entry) => entry.decision === "index").map((entry) => entry.product_id));
  const categoryCounts = {};
  for (const product of verifiedProducts) {
    const category = categoryCounts[product.category] ?? { total: 0, index: 0, noindex: 0 };
    category.total += 1;
    category[indexableIds.has(product.product_id) ? "index" : "noindex"] += 1;
    categoryCounts[product.category] = category;
  }

  return {
    schema_version: 1,
    policy_updated_at: policy.updated_at,
    generated_from_products_updated_at: verifiedProducts.map((product) => product.updated_at).sort((a, b) => b.localeCompare(a))[0] ?? null,
    summary: {
      total_verified_products: verifiedProducts.length,
      index: entries.filter((entry) => entry.decision === "index").length,
      noindex: entries.filter((entry) => entry.decision === "noindex").length,
      categories: categoryCounts
    },
    entries
  };
}
