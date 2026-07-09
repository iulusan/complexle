import { GameState, GuessResult, PropertyFeedback } from "../domain/game";
import { PropertyDefinition } from "../domain/property";
import { mathSpan } from "./latex";

/** Shown once a game ends — reuses the same per-property colors as the guess table, but as a
 *  compact, label-free grid (no property names, no guessed class names) alongside the result. */
export function resultModalView(game: GameState, properties: PropertyDefinition[], targetClassName: string): string {
  if (game.status === "in-progress") return "";

  const won = game.status === "won";
  const lastGuess = game.guesses[game.guesses.length - 1];
  // Same "lucky" definition as the guess table: a correct guess that named a different (but
  // equivalent) class than the target itself.
  const lucky = won && lastGuess.classId !== game.targetClassId;
  const headline = lucky ? "Same Difference!" : won ? "Congratulations!" : "Better Luck Next Time!";
  const reveal = won
    ? lucky
      ? `It is ${mathSpan(targetClassName)}, you said ${mathSpan(lastGuess.className)}`
      : `It is ${mathSpan(targetClassName)}`
    : `It was ${mathSpan(targetClassName)}`;
  const stats = won
    ? `Solved in ${game.guesses.length} / ${game.maxGuesses} guesses`
    : `Used all ${game.maxGuesses} / ${game.maxGuesses} guesses`;
  const lastGuessIndex = game.guesses.length - 1;
  const grid = game.guesses.map((guess, index) => gridRow(guess, properties, lucky && index === lastGuessIndex)).join("");

  return `<dialog id="result-modal" class="rounded-xl border border-slate-200 bg-white p-10 shadow-2xl">
    <div class="w-[26rem] text-center">
      <h2 class="text-3xl font-bold ${lucky ? "text-violet-700" : won ? "text-emerald-700" : "text-red-700"}">${headline}</h2>
      <p class="mt-2 text-base text-slate-700">${reveal}</p>
      <p class="mt-1 text-base text-slate-500">${stats}</p>
      <div class="mt-6 space-y-2">${grid}</div>
      <button type="button" class="mt-8 rounded-md bg-slate-900 px-6 py-2.5 text-base font-medium text-white hover:bg-slate-700"
        onclick="closeModalWithTransition('result-modal')">Close</button>
    </div>
  </dialog>
  <script>
    // Wait for the final guess row's entry animation (300ms, see .guess-row-enter in
    // src/styles/input.css) to finish, plus a beat to let it land, before popping up the modal —
    // showModal() itself then triggers the modal's own fade/scale-in transition (result-modal-in).
    setTimeout(() => document.getElementById("result-modal").showModal(), 600);
  </script>`;
}

function gridRow(guess: GuessResult, properties: PropertyDefinition[], isLucky: boolean): string {
  const squares = properties
    .map((p) => {
      const feedback = guess.properties.find((f) => f.propertyId === p.id);
      return `<span class="h-6 w-6 rounded-sm ${isLucky ? "bg-violet-500" : squareClasses(feedback?.result)}"></span>`;
    })
    .join("");
  return `<div class="flex justify-center gap-2">${squares}</div>`;
}

function squareClasses(result?: PropertyFeedback["result"]): string {
  switch (result) {
    case "equal":
    case "match":
      return "bg-emerald-500";
    case "higher":
      return "bg-sky-500";
    case "lower":
      return "bg-amber-500";
    case "mismatch":
    case "incomparable":
    default:
      return "bg-slate-300";
  }
}
