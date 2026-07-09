import katex from "katex";

// Greek letters used by name (e.g. "Σ_2^P") are spelled out as their actual macros rather than
// left as literal unicode, so KaTeX renders them as proper math symbols.
const GREEK_MACROS: Record<string, string> = { Σ: "\\Sigma", Π: "\\Pi" };

// Quantifier symbols embedded within a name (e.g. "SO∃") — unlike GREEK_MACROS above, these can
// appear as part of a larger string rather than standing alone as the whole base.
const QUANTIFIER_MACROS: Record<string, string> = { "∃": "\\exists", "∀": "\\forall" };

// DLOGTIME-uniform classes are named "U_DLOGTIME-X" where X is the non-uniform class's own name
// (e.g. "U_DLOGTIME-NC^0"). Rendered as bold U, a bold "DLOGTIME" subscript, a bold hyphen back on
// the baseline, then X rendered the normal way — rather than falling through the generic
// base/subscript/superscript split below, which would swallow "DLOGTIME-NC" into one unbolded subscript.
const U_DLOGTIME_PREFIX = "U_DLOGTIME-";

/**
 * Converts a class name like "NC^1", "P^#P", "Σ_2^P", "SO∃", or "U_DLOGTIME-NC^0" into LaTeX
 * source, bolding the base always and bolding the superscript only when it's itself a class name
 * (e.g. "#P" in "P^#P", "P" in "Σ_2^P") rather than a plain hierarchy-level index (e.g. "1" in
 * "NC^1", left as an unbolded numeral). An optional subscript (e.g. the "2" in "Σ_2^P") is
 * likewise left unbolded, since it's a hierarchy-level index too.
 */
function classNameToLatex(name: string): string {
  const escapeHash = (s: string) => s.replace(/#/g, "\\#");

  if (name.startsWith(U_DLOGTIME_PREFIX)) {
    const rest = name.slice(U_DLOGTIME_PREFIX.length);
    return `\\textbf{U}_{\\textbf{DLOGTIME}}\\textbf{-}${classNameToLatex(rest)}`;
  }

  // \textbf{} switches into text mode, where math-only macros like \exists/\forall aren't defined
  // — KaTeX would print them literally instead of the actual symbol. Split around the symbol so
  // it renders directly in the surrounding math mode, unbolded, with the rest still bolded.
  for (const [symbol, macro] of Object.entries(QUANTIFIER_MACROS)) {
    const index = name.indexOf(symbol);
    if (index === -1) continue;
    const prefix = name.slice(0, index);
    const suffix = name.slice(index + symbol.length);
    const prefixTex = prefix ? `\\textbf{${escapeHash(prefix)}}` : "";
    const suffixTex = suffix ? classNameToLatex(suffix) : "";
    return `${prefixTex}${macro}${suffixTex}`;
  }

  const [beforeSuperscript, superscript] = name.split("^");
  const [base, subscript] = beforeSuperscript.split("_");
  const greekBase = GREEK_MACROS[base];

  // Same text-mode issue as above, for standalone Greek-letter bases like "Σ" in "Σ_2^P".
  let tex = greekBase ?? `\\textbf{${escapeHash(base)}}`;
  if (subscript !== undefined) tex += `_{${subscript}}`;
  if (superscript !== undefined) {
    tex += /^\d+$/.test(superscript) ? `^{${superscript}}` : `^{\\textbf{${escapeHash(superscript)}}}`;
  }
  return tex;
}

/**
 * Renders a class name to final KaTeX HTML server-side. Rendering here (rather than shipping raw
 * LaTeX source and re-parsing it client-side after every htmx swap) sidesteps a reliability issue
 * where the browser's auto-render pass would intermittently mis-scan unrelated text elsewhere in
 * the same swapped subtree; server-side rendering also means no client-side KaTeX JS is needed.
 */
export function mathSpan(name: string): string {
  return katex.renderToString(classNameToLatex(name), { throwOnError: false });
}
