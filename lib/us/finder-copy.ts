export type UsFinderReasonOutcome = "match" | "unknown" | "mismatch";

export function usFinderReasonLabel(code: string, outcome: UsFinderReasonOutcome) {
  if (code === "product-type:finder-supported") {
    return outcome === "unknown"
      ? "The manufacturer doesn't say clearly what kind of sauna this is."
      : outcome === "mismatch"
        ? "This isn't a cabin, kit or tent."
        : "This is a cabin, kit or tent.";
  }
  if (code === "space:cabinet-fits") return "The cabin fits your space.";
  if (code === "space:exterior-dimensions") return "The outside size isn't fully stated.";
  if (code === "space:cabinet-exceeds-limit") return "The cabin is bigger than your space.";
  if (code === "space:installation-clearances") return "Check the clearances in the manual.";
  if (code === "space:required-envelope") {
    return outcome === "mismatch"
      ? "With clearances, it's bigger than your space."
      : "It fits your space, clearances included.";
  }
  if (code === "electrical:wood-fired") {
    return outcome === "unknown"
      ? "The manufacturer doesn't say whether it can be wood-fired."
      : "It isn't wood-fired.";
  }
  if (code === "electrical:electric-supply") return "It isn't electric.";
  if (code === "electrical:supply-option") {
    return outcome === "unknown"
      ? "The power details aren't complete."
      : "It needs a different electrical supply.";
  }
  if (code.startsWith("electrical:supply-option:")) return "The electrical supply matches.";
  if (code.startsWith("product-type:")) {
    return outcome === "unknown"
      ? "The type isn't stated."
      : "It's a different type of sauna.";
  }
  if (code.startsWith("heat-type:")) {
    return outcome === "unknown"
      ? "The kind of heat isn't stated."
      : "It heats differently.";
  }
  if (code.startsWith("placement:")) {
    return outcome === "unknown"
      ? "The manufacturer doesn't say indoor or outdoor."
      : "It's meant for a different location.";
  }
  if (code.startsWith("capacity:")) {
    return outcome === "unknown"
      ? "The number of seats isn't stated."
      : "It has fewer seats than you need.";
  }
  if (code.includes(":comparable-price")) return "We don't have a current price for it.";
  if (code.startsWith("budget:")) return "It costs more than your budget.";
  return code;
}
