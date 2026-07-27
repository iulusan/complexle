import "katex/dist/katex.min.css";
import "../styles/input.css";

import { GameMode } from "../domain/game";
import { ComplexityClassRepository } from "../repositories/complexityClassRepository";
import { GameService } from "../services/gameService";
import { gameBoardView } from "../views/gameBoardView";
import { gameContent, homeView } from "../views/homeView";
import { suggestionsView } from "../views/suggestionsView";
import { installInteractions } from "./interactions";
import { LocalStorageGameRepository } from "./localStorageGameRepository";

// Single browser = single player, so there's no real notion of a session — GameService still
// takes a sessionId (it's what keys the daily/practice state), so a fixed constant stands in for
// the cookie a real session middleware would issue.
const SESSION_ID = "local";
const BASE = import.meta.env.BASE_URL;

const classRepo = new ComplexityClassRepository();
const gameService = new GameService(classRepo, new LocalStorageGameRepository());

const appEl = document.getElementById("app") as HTMLElement;

function currentMode(): GameMode {
  const relative = location.pathname.startsWith(BASE) ? location.pathname.slice(BASE.length) : location.pathname;
  return relative.replace(/^\/|\/$/g, "") === "games/practice" ? "practice" : "daily";
}

// htmx (used by the server build) evaluates <script> tags found in swapped HTML — see
// resultModalView's embedded showModal() timer. innerHTML/outerHTML assignment alone doesn't
// execute scripts, so this replicates that one piece of htmx's swap behavior for the shared
// view HTML to keep working unmodified here too.
function executeEmbeddedScripts(root: ParentNode): void {
  root.querySelectorAll("script").forEach((old) => {
    const fresh = document.createElement("script");
    fresh.textContent = old.textContent;
    old.replaceWith(fresh);
  });
}

// Unlike htmx (which aborts a pending request/trigger when its element is removed from the
// DOM), a plain setTimeout keeps running regardless — so any render that might destroy the
// current #guess-suggestions box has to cancel a pending debounced fetch first, or that fetch
// re-queries by id later and populates whatever *new* box now has that id with stale results.
let suggestTimer: number | undefined;

function cancelPendingSuggestions(): void {
  window.clearTimeout(suggestTimer);
}

function renderInto(el: HTMLElement, html: string): void {
  cancelPendingSuggestions();
  el.innerHTML = html;
  executeEmbeddedScripts(el);
}

function renderOuterInto(el: HTMLElement, html: string): void {
  cancelPendingSuggestions();
  const id = el.id;
  el.outerHTML = html;
  const fresh = id ? document.getElementById(id) : null;
  if (fresh) executeEmbeddedScripts(fresh);
}

function renderApp(mode: GameMode): void {
  const game = mode === "daily" ? gameService.getOrCreateDailyGame(SESSION_ID) : gameService.getOrCreatePracticeGame(SESSION_ID);
  const properties = classRepo.getPropertyDefinitions();
  const targetClassName = classRepo.findById(game.targetClassId)?.name ?? "";
  const classCount = classRepo.getAll().length;
  const aliasIndex = classRepo.getAliasIndex();
  renderInto(appEl, homeView({ mode, game, properties, targetClassName, classCount, aliasIndex }));
}

function navigate(mode: GameMode): void {
  history.pushState(null, "", `${BASE}games/${mode}`);
  renderApp(mode);
}

// Mirrors submitGuess in gameController.ts.
document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.matches('[hx-post$="/guesses"]')) return;
  event.preventDefault();

  const mode = currentMode();
  const guessText = String(new FormData(form).get("guess") ?? "");
  const { game, error } = gameService.submitGuess(SESSION_ID, mode, guessText);
  const properties = classRepo.getPropertyDefinitions();
  const targetClassName = classRepo.findById(game.targetClassId)?.name ?? "";

  const gameBoardEl = document.getElementById("game-board");
  if (!gameBoardEl) return;
  renderOuterInto(gameBoardEl, gameBoardView({ mode, game, properties, targetClassName, error }));
});

// Mirrors newPracticeGame in gameController.ts.
document.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest('[hx-post="/games/practice"]');
  if (!button) return;
  event.preventDefault();

  const game = gameService.createPracticeGame(SESSION_ID);
  const properties = classRepo.getPropertyDefinitions();
  const targetClassName = classRepo.findById(game.targetClassId)?.name ?? "";

  const contentEl = document.getElementById("game-content");
  if (!contentEl) return;
  renderInto(contentEl, gameContent({ mode: "practice", game, properties, targetClassName }));
  history.pushState(null, "", `${BASE}games/practice`);
});

// Nav tabs, matching modeTab()'s plain <a href="/games/..."> anchors — intercepted so the app
// stays a single page under the GitHub Pages base path instead of hitting a real (nonexistent) route.
document.addEventListener("click", (event) => {
  const link = (event.target as HTMLElement).closest("a[href^='/games/']");
  if (!(link instanceof HTMLAnchorElement)) return;
  event.preventDefault();
  navigate(link.getAttribute("href")?.includes("practice") ? "practice" : "daily");
});

// Mirrors searchSuggestions in gameController.ts, debounced to match the server form's
// hx-trigger="input changed delay:150ms".
document.addEventListener("input", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.id !== "guess-input") return;
  cancelPendingSuggestions();
  suggestTimer = window.setTimeout(() => {
    const box = document.getElementById("guess-suggestions");
    if (box) renderInto(box, suggestionsView(classRepo.findMatches(input.value)));
  }, 150);
});

window.addEventListener("popstate", () => renderApp(currentMode()));

// So interactions.ts's clearGuessSuggestions (arrow-key select / Enter-autocorrect) can cancel
// the same pending timer — otherwise selecting a suggestion fast enough has the identical race.
window.cancelPendingSuggestions = cancelPendingSuggestions;

installInteractions();
if (location.pathname === BASE || location.pathname === `${BASE}index.html`) {
  history.replaceState(null, "", `${BASE}games/daily`);
}
renderApp(currentMode());
