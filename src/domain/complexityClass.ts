export interface ComplexityClass {
  id: string;
  name: string;
  aliases: string[];
  /** propertyId -> value, for "categorical" properties (Type, Oracle, Promise). */
  categoricalValues: Record<string, string>;
  /** propertyId -> values, for "categorical-multi" properties (Model). */
  categoricalSetValues: Record<string, string[]>;
  /** propertyId -> tier label, for "total-order" properties (Advice). */
  totalOrderValues: Record<string, string>;
  /** Other class ids this class is proven equal to (e.g. IP is equivalent to PSPACE). Symmetric/transitive closure is computed by the repository. */
  equivalentClassIds?: string[];
}
