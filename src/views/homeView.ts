import { GameMode, GameState } from "../domain/game";
import { PropertyDefinition } from "../domain/property";
import { feedbackIcon } from "./feedbackIcon";
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
      <div class="flex items-center gap-2">
        <button type="button" onclick="document.getElementById('how-to-play-modal').showModal()"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300 text-sm font-semibold text-slate-500 transition hover:border-slate-500 hover:text-slate-900"
          aria-label="How to play">?</button>
        ${colorblindToggle()}
      </div>
    </div>
    <nav class="mt-4 flex gap-4 border-b border-slate-200">
      ${modeTab("daily", "Daily", mode)}
      ${modeTab("practice", "Practice", mode)}
    </nav>
    <div id="game-content" class="mt-6">${gameContent({ mode, game, properties, targetClassName })}</div>
  </main>
  <footer class="pb-6 text-center text-sm text-slate-500">featuring ${classCount} classes (and counting)</footer>
  ${aliasIndexScript}
  ${howToPlayModalView()}
  ${colorblindLegendModalView()}`;
}

// Same round style as the "?" button; filled in while colorblind mode is on. The on/off look is
// driven by the `colorblind` class on <html> rather than rendered state, so it's correct on every
// render without the view needing to know the stored preference.
function colorblindToggle(): string {
  return `<button type="button" onclick="toggleColorblindMode()"
    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition hover:border-slate-500 hover:text-slate-900 colorblind:border-slate-900 colorblind:bg-slate-900 colorblind:text-white colorblind:hover:bg-slate-700 colorblind:hover:text-white"
    aria-label="Toggle colorblind mode" title="Colorblind mode">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  </button>`;
}

// Shown only when the player switches colorblind mode on (see toggleColorblindMode), not when
// it's restored from a stored preference — by then they already know what the symbols mean.
function colorblindLegendModalView(): string {
  const entries: [string, string][] = [
    [feedbackIcon("match", false, "h-5 w-5"), "Match"],
    [feedbackIcon("mismatch", false, "h-5 w-5"), "No match, or not comparable"],
    [feedbackIcon("lower", false, "h-5 w-5"), "Go up: Larger, More Advice, Less Uniform"],
    [feedbackIcon("higher", false, "h-5 w-5"), "Go down: Smaller, Less Advice, More Uniform"],
    [feedbackIcon(undefined, true, "h-5 w-5"), "You won with a proven-equal class"],
  ];
  const rows = entries
    .map(([icon, label]) => `<li class="flex items-center gap-3">${icon}<span>${label}</span></li>`)
    .join("");
  return `<dialog id="colorblind-modal" class="rounded-xl border border-slate-200 bg-white p-8 shadow-2xl">
    <div class="w-80 text-left">
      <h2 class="text-xl font-bold text-slate-900">Colorblind Mode</h2>
      <p class="mt-3 text-sm text-slate-600">Every hint now shows a symbol next to its color:</p>
      <ul class="mt-3 space-y-2 text-sm text-slate-700">${rows}</ul>
      <button type="button" onclick="closeModalWithTransition('colorblind-modal')"
        class="mt-6 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        Got it
      </button>
    </div>
  </dialog>`;
}

function howToPlayModalView(): string {
  return `<dialog id="how-to-play-modal" class="rounded-xl border border-slate-200 bg-white p-8 shadow-2xl">
    <div class="w-80 text-left">
      <h2 class="text-xl font-bold text-slate-900">How to Play</h2>
      <p class="mt-3 text-sm text-slate-600">
        Guess the secret complexity class within 6 tries. Every property in your guess gets a
        colored hint showing how it compares to the target, pointing you toward the answer.
      </p>
      <p class="mt-3 text-sm text-slate-600">
        Hard to tell the colors apart? The eye button turns on colorblind mode, which adds a
        symbol to every hint.
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
