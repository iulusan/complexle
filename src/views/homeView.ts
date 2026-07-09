import { GameMode, GameState } from "../domain/game";
import { PropertyDefinition } from "../domain/property";
import { gameBoardView } from "./gameBoardView";

export interface HomeViewModel {
  mode: GameMode;
  game: GameState;
  properties: PropertyDefinition[];
  targetClassName: string;
}

export interface HomePageViewModel extends HomeViewModel {
  classCount: number;
  aliasIndex: Record<string, string>;
}

export function homeView({ mode, game, properties, targetClassName, classCount, aliasIndex }: HomePageViewModel): string {
  // Every valid guess string mapped to its canonical class name, for client-side Enter-to-autocorrect
  // (see selectGuessSuggestion/handleGuessKeydown in layout.ts) — safe to inline as-is since it's built
  // entirely from our own class/alias data, never user input.
  const aliasIndexScript = `<script>window.__GUESS_ALIASES__ = ${JSON.stringify(aliasIndex).replace(/</g, "\\u003c")};</script>`;

  return `<main class="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
    <div class="flex items-center justify-between">
      <h1 class="text-4xl font-bold text-slate-900">Complexle</h1>
      <button type="button" onclick="document.getElementById('how-to-play-modal').showModal()"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300 text-sm font-semibold text-slate-500 transition hover:border-slate-500 hover:text-slate-900"
        aria-label="How to play">?</button>
    </div>
    <nav class="mt-4 flex gap-4 border-b border-slate-200">
      ${modeTab("daily", "Daily", mode)}
      ${modeTab("practice", "Practice", mode)}
    </nav>
    <div id="game-content" class="mt-6">${gameContent({ mode, game, properties, targetClassName })}</div>
  </main>
  <footer class="pb-6 text-center text-sm text-slate-500">featuring ${classCount} classes (and counting)</footer>
  ${aliasIndexScript}
  ${howToPlayModalView()}`;
}

function howToPlayModalView(): string {
  return `<dialog id="how-to-play-modal" class="rounded-xl border border-slate-200 bg-white p-8 shadow-2xl">
    <div class="w-80 text-left">
      <h2 class="text-xl font-bold text-slate-900">How to Play</h2>
      <p class="mt-3 text-sm text-slate-600">
        Guess the secret complexity class within 6 tries. Every property in your guess gets a
        colored hint showing how it compares to the target, pointing you toward the answer.
      </p>
      <button type="button" onclick="closeModalWithTransition('how-to-play-modal')"
        class="mt-6 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        Got it
      </button>
    </div>
  </dialog>`;
}

function modeTab(tabMode: GameMode, label: string, activeMode: GameMode): string {
  const classes =
    tabMode === activeMode
      ? "border-b-2 border-slate-900 pb-2 text-sm font-semibold text-slate-900"
      : "border-b-2 border-transparent pb-2 text-sm text-slate-500 hover:text-slate-700";
  return `<a href="/games/${tabMode}" class="${classes}">${label}</a>`;
}

export function gameContent({ mode, game, properties, targetClassName }: HomeViewModel): string {
  const newGameButton =
    mode === "practice"
      ? `<button hx-post="/games/practice" hx-target="#game-content" hx-swap="innerHTML"
          class="mb-4 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
          New practice game
        </button>`
      : "";
  return `${newGameButton}${gameBoardView({ mode, game, properties, targetClassName })}`;
}
