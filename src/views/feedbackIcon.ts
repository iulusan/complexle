import { PropertyFeedback } from "../domain/game";

// Solid 24x24 shapes, one per hint color, so a hint never relies on color alone.
const CHECK = `<polygon points="1,12.5 5,8.5 9,12.5 19,2.5 23,6.5 9,20.5" />`;
const CROSS = `<path d="M5.5 1.5 12 8 18.5 1.5 22.5 5.5 16 12 22.5 18.5 18.5 22.5 12 16 5.5 22.5 1.5 18.5 8 12 1.5 5.5Z" />`;
const TRIANGLE_UP = `<polygon points="12,3 22,21 2,21" />`;
const TRIANGLE_DOWN = `<polygon points="2,3 22,3 12,21" />`;
const STAR = `<polygon points="12,2 14.9,8.6 22,9.3 16.6,14 18.2,21 12,17.3 5.8,21 7.4,14 2,9.3 9.1,8.6" />`;

/**
 * Colorblind-mode symbol for a hint. Always rendered, but hidden unless <html> carries the
 * `colorblind` class (see the custom variant in input.css) — so toggling the mode is pure CSS and
 * never needs a re-render. `colorClass` overrides the default per-hint color (e.g. white-on-color
 * in the result modal's grid squares).
 */
export function feedbackIcon(result: PropertyFeedback["result"] | undefined, isLucky: boolean, sizeClass: string, colorClass?: string): string {
  const [shape, defaultColor] = isLucky ? [STAR, "text-violet-600"] : iconFor(result);
  if (!shape) return "";
  return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
    class="hidden shrink-0 colorblind:inline-block ${sizeClass} ${colorClass ?? defaultColor}">${shape}</svg>`;
}

function iconFor(result?: PropertyFeedback["result"]): [string, string] | [undefined, undefined] {
  switch (result) {
    case "equal":
    case "match":
      return [CHECK, "text-emerald-700"];
    // "higher" means the guess sits above the target — shown in blue as "Smaller", so it points down.
    case "higher":
      return [TRIANGLE_DOWN, "text-sky-700"];
    case "lower":
      return [TRIANGLE_UP, "text-amber-600"];
    case "mismatch":
    case "incomparable":
      return [CROSS, "text-slate-500"];
    default:
      return [undefined, undefined];
  }
}
