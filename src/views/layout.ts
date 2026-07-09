import { escapeHtml } from "./escapeHtml";

export function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/styles.css" />
  <!-- Styles only the server-rendered KaTeX HTML (see src/views/latex.ts) — no client-side KaTeX JS needed. -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.17.0/dist/katex.min.css" />
  <script src="https://unpkg.com/htmx.org@1.9.12"></script>
  <script>
    // Closes a <dialog> with a reverse fade/scale-out transition (see .closing in input.css)
    // instead of vanishing instantly — mirrors the fade/scale-in play on open.
    function closeModalWithTransition(id) {
      const dialog = document.getElementById(id);
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

    // Index of the arrow-key-highlighted suggestion, or -1 when none is highlighted (either
    // nothing navigated yet, or the user typed and invalidated the previous highlight).
    let guessHighlightIndex = -1;

    function getGuessSuggestionButtons() {
      return Array.from(document.querySelectorAll("#guess-suggestions button[data-value]"));
    }

    function setGuessHighlight(index) {
      const buttons = getGuessSuggestionButtons();
      buttons.forEach((button, i) => button.classList.toggle("bg-slate-100", i === index));
      guessHighlightIndex = index;
    }

    function clearGuessSuggestions() {
      document.getElementById("guess-suggestions").innerHTML = "";
      guessHighlightIndex = -1;
    }

    function selectGuessSuggestion(button) {
      const input = document.getElementById("guess-input");
      input.value = button.dataset.value;
      clearGuessSuggestions();
      input.focus();
    }

    // Arrow keys navigate the live suggestions: the first press highlights a suggestion (like a
    // mouse hover would), further presses in the same direction move the highlight along the list.
    // On Enter: if a suggestion is highlighted, autocorrect to it always — even if what's currently
    // typed is already a valid guess on its own (e.g. typed "p" but arrowed onto "P/poly" — Enter
    // fills in "P/poly" rather than submitting "p") — since an active highlight means the player is
    // still choosing. Only once nothing is highlighted does an exact, already-valid typed guess
    // submit directly on Enter; otherwise it autocorrects to the top suggestion instead. Either way,
    // an autocorrect only ever fills the input — a second Enter is needed to actually submit, so a
    // guess never silently submits as something the player didn't confirm.
    function handleGuessKeydown(event) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const buttons = getGuessSuggestionButtons();
        if (buttons.length === 0) return true;
        event.preventDefault();

        if (guessHighlightIndex === -1) {
          setGuessHighlight(event.key === "ArrowDown" ? 0 : buttons.length - 1);
        } else if (event.key === "ArrowDown") {
          setGuessHighlight(Math.min(guessHighlightIndex + 1, buttons.length - 1));
        } else {
          setGuessHighlight(Math.max(guessHighlightIndex - 1, 0));
        }
        return false;
      }

      if (event.key !== "Enter") return true;

      const input = event.target;
      const buttons = getGuessSuggestionButtons();
      const highlighted = guessHighlightIndex >= 0 ? buttons[guessHighlightIndex] : null;

      if (highlighted) {
        event.preventDefault();
        input.value = highlighted.dataset.value;
        clearGuessSuggestions();
        return false;
      }

      const typed = input.value.trim().toLowerCase();
      const aliases = window.__GUESS_ALIASES__ || {};
      if (!typed || aliases[typed]) return true;

      const target = buttons[0];
      if (!target) return true;

      event.preventDefault();
      input.value = target.dataset.value;
      clearGuessSuggestions();
      return false;
    }
  </script>
</head>
<body class="flex min-h-screen flex-col bg-white text-slate-900">
  ${body}
</body>
</html>`;
}
