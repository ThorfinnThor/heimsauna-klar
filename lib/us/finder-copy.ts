export type UsFinderReasonOutcome = "match" | "unknown" | "mismatch";

export function usFinderReasonLabel(code: string, outcome: UsFinderReasonOutcome) {
  if (code === "product-type:finder-supported") {
    return outcome === "unknown"
      ? "The product type is not documented well enough to confirm finder eligibility."
      : outcome === "mismatch"
        ? "This product type is outside the cabin, kit and tent categories covered by the finder."
        : "This is a sauna cabin, kit or tent covered by the finder.";
  }
  if (code === "space:cabinet-fits") return "The documented cabinet dimensions fit the space entered.";
  if (code === "space:exterior-dimensions") return "Exterior dimensions are not fully documented.";
  if (code === "space:cabinet-exceeds-limit") return "The cabinet is larger than the space entered.";
  if (code === "space:installation-clearances") return "Minimum installation clearances still need to be checked.";
  if (code === "space:required-envelope") {
    return outcome === "mismatch"
      ? "The documented cabinet and clearance envelope is larger than the space entered."
      : "The documented cabinet and clearance envelope fits the space entered.";
  }
  if (code === "electrical:wood-fired") {
    return outcome === "unknown"
      ? "A wood-fired energy source is not documented for this configuration."
      : "The documented energy source does not match the wood-fired selection.";
  }
  if (code === "electrical:electric-supply") return "The documented energy source does not match an electric supply.";
  if (code === "electrical:supply-option") {
    return outcome === "unknown"
      ? "The selected electrical supply is not fully confirmed for this configuration."
      : "The documented electrical supply does not match the selection.";
  }
  if (code.startsWith("electrical:supply-option:")) return "A documented supply option matches the electrical selection.";
  if (code.startsWith("product-type:")) {
    return outcome === "unknown"
      ? "The product type is not documented for this configuration."
      : "The documented product type does not match the selection.";
  }
  if (code.startsWith("heat-type:")) {
    return outcome === "unknown"
      ? "The heat type is not documented for this configuration."
      : "The documented heat type does not match the selection.";
  }
  if (code.startsWith("placement:")) {
    return outcome === "unknown"
      ? "Placement suitability is not documented for this configuration."
      : "The documented placement does not match the selection.";
  }
  if (code.startsWith("capacity:")) {
    return outcome === "unknown"
      ? "Seated capacity is not documented for this configuration."
      : "The documented seated capacity is below the number entered.";
  }
  if (code.includes(":comparable-price")) return "No current, complete price with the selected scope is documented.";
  if (code.startsWith("budget:")) return "The comparable documented price is above the selected limit.";
  return code;
}
