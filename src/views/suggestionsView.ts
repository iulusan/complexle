import { ComplexityClass } from "../domain/complexityClass";
import { escapeHtml } from "./escapeHtml";
import { mathSpan } from "./latex";

export function suggestionsView(matches: ComplexityClass[]): string {
  if (matches.length === 0) return "";

  const items = matches
    .map(
      (c) => `<button type="button" data-value="${escapeHtml(c.name)}" onclick="selectGuessSuggestion(this)"
        class="block w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100">${mathSpan(c.name)}</button>`
    )
    .join("");

  return `<div class="overflow-hidden rounded-md border border-slate-200 bg-white shadow-md">${items}</div>`;
}
