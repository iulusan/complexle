import { GameMode, GameState, GuessResult, PropertyFeedback } from "../domain/game";
import { PropertyDefinition } from "../domain/property";
import { escapeHtml } from "./escapeHtml";
import { mathSpan } from "./latex";
import { resultModalView } from "./resultModalView";

export interface GameBoardViewModel {
  mode: GameMode;
  game: GameState;
  properties: PropertyDefinition[];
  targetClassName: string;
  error?: string;
}

export function gameBoardView({ mode, game, properties, targetClassName, error }: GameBoardViewModel): string {
  const header = properties
    .map((p) => `<th class="border border-slate-200 bg-slate-50 px-3 py-2 text-center font-medium">${escapeHtml(p.label)}</th>`)
    .join("");
  const lastGuessIndex = game.guesses.length - 1;
  const rows = game.guesses
    .map((g, index) => {
      const isLatest = index === lastGuessIndex;
      // A "lucky" win is a correct guess that named a different (but equivalent) class than the
      // target itself — e.g. guessing "PSPACE" when the secret is IP. classId always holds the
      // literally-typed guess's own id (see evaluateGuess in gameService.ts), so it still differs
      // from the target even though the hint values themselves were scored as if you'd typed the
      // target's own name.
      const isLucky = isLatest && game.status === "won" && g.classId !== game.targetClassId;
      return guessRow(g, properties, isLatest, isLucky);
    })
    .join("");
  const errorBanner = error
    ? `<p class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">${escapeHtml(error)}</p>`
    : "";
  const form = game.status === "in-progress" ? guessForm(mode) : "";

  // Fixed (not content-dependent) top offset: tuned so a full 6-guess table's vertical
  // center lands near the viewport's center, without recentering as rows are added — the
  // table grows downward from this constant anchor instead of the anchor following its height.
  return `<section id="game-board" data-status="${game.status}" class="space-y-4">
    ${renderStatus(game)}
    ${errorBanner}
    ${form}
    <div class="pt-[max(1rem,calc(50vh_-_20rem))]">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead><tr><th class="border border-slate-200 bg-slate-50 px-3 py-2 text-center font-medium">Guess</th>${header}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="mt-2 text-center text-sm text-slate-500">${game.guesses.length} / ${game.maxGuesses} guesses</p>
    </div>
    ${resultModalView(game, properties, targetClassName)}
  </section>`;
}

function guessRow(guess: GuessResult, properties: PropertyDefinition[], isLatest: boolean, isLucky: boolean): string {
  const cells = properties
    .map((p) => {
      const feedback = guess.properties.find((f) => f.propertyId === p.id);
      return `<td class="${isLucky ? LUCKY_CELL_CLASSES : cellClasses(feedback?.result)}">${describeFeedback(feedback, p)}</td>`;
    })
    .join("");
  const rowClasses = [isLucky ? "bg-violet-50" : guess.correct ? "bg-emerald-50" : "", isLatest ? "guess-row-enter" : ""]
    .filter(Boolean)
    .join(" ");
  return `<tr class="${rowClasses}"><td class="border border-slate-200 px-3 py-2 text-center font-medium">${mathSpan(guess.className)}</td>${cells}</tr>`;
}

const LUCKY_CELL_CLASSES = "border border-slate-200 px-3 py-2 text-center bg-violet-100 text-violet-900";

function cellClasses(result?: PropertyFeedback["result"]): string {
  const base = "border border-slate-200 px-3 py-2 text-center";
  switch (result) {
    case "equal":
    case "match":
      return `${base} bg-emerald-100 text-emerald-900`;
    case "mismatch":
      return `${base} bg-slate-100 text-slate-500`;
    case "higher":
      return `${base} bg-sky-100 text-sky-900`;
    case "lower":
      return `${base} bg-amber-100 text-amber-900`;
    case "incomparable":
      return `${base} bg-slate-100 text-slate-500`;
    default:
      return base;
  }
}

function describeFeedback(feedback: PropertyFeedback | undefined, def: PropertyDefinition): string {
  if (!feedback) return "";
  const suffix = feedback.value ? ` (${escapeHtml(feedback.value)})` : "";
  const directionLabels = def.kind === "partial-order" || def.kind === "total-order" ? def.directionLabels : undefined;
  switch (feedback.result) {
    case "equal":
      return feedback.value ? `Equal${suffix}` : "Match";
    case "higher":
      return directionLabels ? `${directionLabels.higher}${suffix}` : `Higher ↑${suffix}`;
    case "lower":
      return directionLabels ? `${directionLabels.lower}${suffix}` : `Lower ↓${suffix}`;
    case "incomparable":
      // For Inclusion, "Incomparable" means an open containment question — for Uniformity it just
      // means one side has no circuit characterization at all, not a matter of degree, so it gets
      // its own, less loaded wording.
      return def.id === "uniformity" ? "Not Comparable" : "Incomparable";
    case "match":
    case "mismatch":
      return escapeHtml(feedback.value ?? "");
    default:
      return "";
  }
}

function renderStatus(game: GameState): string {
  if (game.status === "won") {
    return `<p class="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">Solved in ${game.guesses.length} guesses!</p>`;
  }
  if (game.status === "lost") {
    return `<p class="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">Out of guesses.</p>`;
  }
  return "";
}

function guessForm(mode: GameMode): string {
  return `<form hx-post="/games/${mode}/guesses" hx-target="#game-board" hx-swap="outerHTML" class="flex gap-2">
    <div class="relative flex-1">
      <input type="text" id="guess-input" name="guess" placeholder="Guess a complexity class" autocomplete="off" required
        hx-get="/suggestions" hx-trigger="input changed delay:150ms" hx-target="#guess-suggestions" hx-swap="innerHTML"
        onkeydown="return handleGuessKeydown(event)" oninput="guessHighlightIndex = -1"
        class="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none" />
      <div id="guess-suggestions" class="absolute inset-x-0 top-full z-10 mt-1"></div>
    </div>
    <button type="submit" class="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700">Guess</button>
  </form>`;
}
