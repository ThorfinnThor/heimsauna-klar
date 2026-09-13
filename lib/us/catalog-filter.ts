export type UsCatalogItem = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  form: string | null;
  heatType: string | null;
  placements: string[] | null;
  seatedCapacity: number | null;
  voltages: number[] | null;
  exteriorDimensions: string | null;
};

export type UsCatalogFilters = {
  query: string;
  placement: "all" | "indoor" | "outdoor";
  capacity: "all" | "1" | "2" | "4-plus";
  voltage: "all" | "120" | "240";
  brand: string;
};

export const defaultUsCatalogFilters: UsCatalogFilters = {
  query: "",
  placement: "all",
  capacity: "all",
  voltage: "all",
  brand: "all",
};

export function normalizeUsCatalogFilters(values: Partial<Record<keyof UsCatalogFilters, string>>): UsCatalogFilters {
  const placement = values.placement === "indoor" || values.placement === "outdoor" ? values.placement : "all";
  const capacity = values.capacity === "1" || values.capacity === "2" || values.capacity === "4-plus" ? values.capacity : "all";
  const voltage = values.voltage === "120" || values.voltage === "240" ? values.voltage : "all";
  return {
    query: values.query?.trim().slice(0, 80) ?? "",
    placement,
    capacity,
    voltage,
    brand: values.brand?.trim().slice(0, 80) || "all",
  };
}

export function filterUsCatalogItems(items: UsCatalogItem[], filters: UsCatalogFilters): UsCatalogItem[] {
  const query = filters.query.toLocaleLowerCase("en-US");
  return items.filter((item) => {
    if (query && ![item.brand, item.model, item.form ?? "", item.heatType ?? ""]
      .join(" ").toLocaleLowerCase("en-US").includes(query)) return false;
    if (filters.placement !== "all" && !item.placements?.includes(filters.placement)) return false;
    if (filters.capacity !== "all") {
      if (item.seatedCapacity === null) return false;
      if (filters.capacity === "4-plus" ? item.seatedCapacity < 4 : item.seatedCapacity !== Number(filters.capacity)) return false;
    }
    if (filters.voltage !== "all" && !item.voltages?.includes(Number(filters.voltage))) return false;
    if (filters.brand !== "all" && item.brand !== filters.brand) return false;
    return true;
  });
}
