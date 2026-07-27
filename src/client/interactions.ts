// Client-side port of the inline <script> block in src/views/layout.ts. That version is a
// classic (non-module) script string embedded directly in the server-rendered page, so its
// top-level `let guessHighlightIndex` and functions are already plain globals; here the same
// code has to be an ES module (Vite bundles it), so the pieces referenced directly from
// rendered HTML (onclick="...", onkeydown="...", and the bare `guessHighlightIndex = -1` in
// oninput="...") are attached to `window` explicitly instead.
declare global {
  interface Window {
    guessHighlightIndex: number;
    closeModalWithTransition: (id: string) => void;
    selectGuessSuggestion: (button: HTMLElement) => void;
    handleGuessKeydown: (event: KeyboardEvent) => boolean;
    __GUESS_ALIASES__?: Record<string, string>;
    // Set by main.ts — cancels its debounced suggestions fetch, so selecting/dismissing a
    // suggestion here can't be raced by that fetch re-populating the box afterward.
    cancelPendingSuggestions?: () => void;
  }
}

function closeModalWithTransition(id: string): void {
  const dialog = document.getElementById(id) as HTMLDialogElement | null;
  if (!dialog) return;
  dialog.addEventListener(
    "animationend",
    () => {
      dialog.classList.remove("closing");
      dialog.close();
    },
    { once: true }
  );
  dialog.classList.add("closing");
}

function getGuessSuggestionButtons(): HTMLButtonElement[] {
  return Array.from(document.querySelectorAll("#guess-suggestions button[data-value]"));
}

function setGuessHighlight(index: number): void {
  const buttons = getGuessSuggestionButtons();
  buttons.forEach((button, i) => button.classList.toggle("bg-slate-100", i === index));
  window.guessHighlightIndex = index;
}

function clearGuessSuggestions(): void {
  window.cancelPendingSuggestions?.();
  const box = document.getElementById("guess-suggestions");
  if (box) box.innerHTML = "";
  window.guessHighlightIndex = -1;
}

function selectGuessSuggestion(button: HTMLElement): void {
  const input = document.getElementById("guess-input") as HTMLInputElement | null;
  if (input) input.value = button.dataset.value ?? "";
  clearGuessSuggestions();
  input?.focus();
}

function handleGuessKeydown(event: KeyboardEvent): boolean {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    const buttons = getGuessSuggestionButtons();
    if (buttons.length === 0) return true;
    event.preventDefault();

    if (window.guessHighlightIndex === -1) {
      setGuessHighlight(event.key === "ArrowDown" ? 0 : buttons.length - 1);
    } else if (event.key === "ArrowDown") {
      setGuessHighlight(Math.min(window.guessHighlightIndex + 1, buttons.length - 1));
    } else {
      setGuessHighlight(Math.max(window.guessHighlightIndex - 1, 0));
    }
    return false;
  }

  if (event.key !== "Enter") return true;

  const input = event.target as HTMLInputElement;
  const buttons = getGuessSuggestionButtons();
  const highlighted = window.guessHighlightIndex >= 0 ? buttons[window.guessHighlightIndex] : null;

  if (highlighted) {
    event.preventDefault();
    input.value = highlighted.dataset.value ?? "";
    clearGuessSuggestions();
    return false;
  }

  const typed = input.value.trim().toLowerCase();
  const aliases = window.__GUESS_ALIASES__ || {};
  if (!typed || aliases[typed]) return true;

  const target = buttons[0];
  if (!target) return true;

  event.preventDefault();
  input.value = target.dataset.value ?? "";
  clearGuessSuggestions();
  return false;
}

export function installInteractions(): void {
  window.guessHighlightIndex = -1;
  window.closeModalWithTransition = closeModalWithTransition;
  window.selectGuessSuggestion = selectGuessSuggestion;
  window.handleGuessKeydown = handleGuessKeydown;
}
