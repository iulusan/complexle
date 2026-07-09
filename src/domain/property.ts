export type PropertyKind = "partial-order" | "total-order" | "categorical" | "categorical-multi";

interface PropertyDefinitionBase {
  id: string;
  label: string;
}

/**
 * Labels shown for "higher"/"lower" results, phrased as guidance on which way to move the
 * next guess (e.g. "Smaller") rather than a description of the guess's own position
 * (e.g. "Higher ↑"). Falls back to the latter when omitted.
 */
export interface DirectionLabels {
  higher: string;
  lower: string;
}

/** Compared via a containment graph between classes directly (e.g. Inclusion). */
export interface PartialOrderProperty extends PropertyDefinitionBase {
  kind: "partial-order";
  directionLabels?: DirectionLabels;
}

/** Each class has one value from a fixed, ordered tier list (e.g. Advice). */
export interface TotalOrderProperty extends PropertyDefinitionBase {
  kind: "total-order";
  /** Ordered lowest to highest; index is the rank used for comparison. */
  tiers: string[];
  directionLabels?: DirectionLabels;
}

/** Each class has exactly one value from an unordered set (e.g. Type, Oracle, Promise). */
export interface CategoricalProperty extends PropertyDefinitionBase {
  kind: "categorical";
}

/** Each class may carry multiple valid values; a guess matches on any overlap (e.g. Model). */
export interface CategoricalMultiProperty extends PropertyDefinitionBase {
  kind: "categorical-multi";
}

export type PropertyDefinition = PartialOrderProperty | TotalOrderProperty | CategoricalProperty | CategoricalMultiProperty;

export type OrderComparison = "equal" | "lower" | "higher" | "incomparable";
export type CategoricalComparison = "match" | "mismatch";

export interface InclusionEdge {
  /** `from` is a subset of `to` for the given partial-order property. */
  from: string;
  to: string;
}
