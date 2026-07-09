# Complexle — Project Notes

Technical/maintainer documentation: schema, architecture, and data-modeling decisions. For player-facing instructions, see [README.md](README.md).

A Wordle-style guessing game for computational complexity classes. Guess a target class; each guess reveals how it relates to the target across a fixed set of properties, until you get it exactly or run out of guesses.

## How to play

- **Daily**: one shared target class per day, same for everyone, at `/games/daily`.
- **Practice**: unlimited random targets at `/games/practice`, with a "New practice game" button to reroll.
- Type a class name or known alias (e.g. `np`, `p/poly`, `co-np`) and submit. All properties are revealed for every guess — nothing is hidden or progressive.
- You win by guessing the exact class, or any class **proven equal** to it (e.g. the target IP and a guess of PSPACE both win, since IP = PSPACE). A winning guess via equivalence is still scored using *your* guess's own honest properties, not the target's — so if the target is IP and you type "PSPACE", Model reads `TM` (PSPACE's own tag), not `Interactive`. The win screen calls this out as a "Same Difference!" result and shows both names.
- You lose if you run out of guesses (6 by default) without doing so.
- A guess that doesn't resolve to a known class name shows an error and does **not** consume a guess. Guessing the same class twice is rejected the same way.

## Property schema

Every guess is scored against the target across seven properties. Each property has one of four comparison kinds:

| Property | Kind | What it compares |
|---|---|---|
| **Inclusion** | Partial order | Containment between classes (`X ⊆ Y`), via known inclusion results. Feedback is `higher` / `lower` / `equal` / `incomparable` relative to the target. "Incomparable" means no known containment holds in either direction in the accepted hierarchy — it does **not** imply a proven separation; most inclusions in the graph are known true even where strictness is an open problem. |
| **Model** | Categorical, multi-valued | The underlying computational model: `TM`, `NTM`, `ATM`, `Circuit`, `Quantum`, `PTM`, `Interactive`, `TM with Advice`, `TM with Oracle`, `Reducibility`, `Descriptive`. A class can carry more than one valid tag (e.g. P/poly is both `Circuit` and `TM with Advice`); a guess matches if its tags overlap at all with the target's. `NTM` is existential-only nondeterminism; `ATM` covers general alternation, including the purely-universal case (e.g. coNP). `Reducibility` is for classes defined as "everything logspace-reducible to a fixed problem" (e.g. LOGCFL, DET) rather than by a machine resource bound directly. `Descriptive` is for classes defined via a logic (e.g. first-order logic plus some operator) rather than a machine model at all. |
| **Type** | Categorical | The kind of problem the class solves: `Decision`, `Function`, `Communication`. `Function` covers both ordinary function problems and counting problems (e.g. #P) — counting is really just a function that outputs a number, so it isn't tracked as a separate value. |
| **Advice** | Total order | Non-uniformity, as an amount of advice: `None` < `O(1)` < `O(log n)` < `Polynomial` < `Exponential/unbounded`. |
| **Uniformity** | Total order | How restrictive a machine model is needed to generate a class's circuit family: `DLOGTIME` < `AC^0` < `L` < `P` < `Non-Uniform`, or `N/A` for classes with no non-uniformity axis at all (most of the roster). `Non-Uniform` is used both for the roster's Circuit-tagged classes (proven-equal or defined as non-uniform circuit families) and for every advice-bearing class (`X/poly`, `X/log`, etc.) — advice is itself a form of non-uniformity (a per-length string that can smuggle in information no single algorithm generates), even when there's no *specific proven circuit-family equivalence* backing it the way P/poly has one. `DLOGTIME` covers both DLOGTIME- and ALOGTIME-uniformity, which are proven equivalent (Barrington–Immerman–Straubing) for the classes here, so only one tier is used rather than asserting a false ordering between them. |
| **Oracle** | Categorical | Whether the class's definition involves an oracle: `No`, `Yes` (defined relative to some fixed external oracle, e.g. P^NP), or `Self-low` (defined via a self-oracle where `X^X = X`). |
| **Promise** | Categorical | Whether the class is defined over promise problems (`Promise`, e.g. PromiseBPP) or total languages (`Total`, e.g. P, NP), or `N/A` where the distinction doesn't cleanly apply. |

Design notes:
- Partial-order feedback uses the *known/accepted* containment structure, sidestepping open separation questions entirely — the game only encodes which inclusions are established, not whether they're proven strict.
- Model deliberately does not encode alternation depth/quantifier pattern (e.g. Σ₂p vs. Π₂p vs. Θ₂p all show as `ATM`) — Inclusion and the other properties are relied on to tell those apart.
- Total-order properties normally only ever return `higher` / `lower` / `equal` (Advice never returns `incomparable` — it's a genuine total order for every class in the roster). Uniformity is the exception: `N/A` is a sentinel, not a ranked tier. Two `N/A`s compare as `equal` (both genuinely "not applicable"); an `N/A` against a real tier compares as `incomparable` rather than asserting a false "more/less uniform" relationship, but is displayed as **"Not Comparable"** rather than "Incomparable" — unlike Inclusion's `incomparable` (an open containment question), this one just means the axis doesn't apply to one side, not a matter of degree.

### Proven-equal classes

Some classes are proven equal despite being defined (and modeled) completely differently. Each is kept as its own roster entry with its own honest Model/Advice/etc. (never merged into the class it equals, and never reduced to a mere alias of it), and declares `equivalentClassIds` pointing at the class(es) it's proven equal to. The repository then:

- accepts a guess as correct if it's equivalent to the target, not just identical;
- propagates containment across the equivalence group, so e.g. `NP ⊆ PSPACE` correctly also yields `NP ⊆ IP`, and IP vs. PSPACE compare as `equal` rather than `incomparable`.

Current examples:

| Class | Model | Proven equal to | Theorem |
|---|---|---|---|
| **IP** | `Interactive` | PSPACE | Shamir '92 |
| **QIP** | `Interactive`, `Quantum` | PSPACE | Jain–Ji–Upadhyay–Watrous '10 |
| **MIP** | `Interactive` | NEXP | Babai–Fortnow–Lund '91 |
| **QMIP** | `Interactive`, `Quantum` | TR (RE) | quantum multi-prover interactive proofs |
| **MIP\*** | `Interactive`, `Quantum` | TR (RE) | Ji–Natarajan–Vidick–Wright–Yuen '20 |
| **PCP(log,1)** | `Interactive` | NP | the PCP theorem (Arora–Safra, Arora–Lund–Motwani–Sudan–Szegedy) |
| **PCP(poly,poly)** | `Interactive` | MIP | randomness/query-complexity reformulation of MIP |
| **P^PP** | `TM with Oracle` | P^#P | a PP oracle and a #P oracle simulate each other via binary search/thresholding |
| **AL** (Alternating Logspace) | `ATM` | P | Chandra–Kozen–Stockmeyer alternation theorem |
| **AP** (Alternating P) | `ATM` | PSPACE | Chandra–Kozen–Stockmeyer alternation theorem |
| **APSPACE** (Alternating PSPACE) | `ATM` | EXP | Chandra–Kozen–Stockmeyer alternation theorem |
| **coNL** | `ATM` | NL | Immerman–Szelepcsényi theorem |
| **NPSPACE** | `NTM` | PSPACE | Savitch's theorem |
| **NEXPSPACE** | `NTM` | EXPSPACE | Savitch's theorem |
| **AC** | `Circuit` (same as NC) | NC | full hierarchies coincide at the union/limit level |
| **SAC** | `Circuit` (same as NC) | NC | full hierarchies coincide at the union/limit level |
| **U_DLOGTIME-NC^1** | `Circuit` | ALOGTIME | Barrington–Immerman–Straubing |
| **LH** | `ATM` | U_DLOGTIME-AC^0 | Barrington–Immerman–Straubing (the LOGTIME hierarchy) |
| **FO[Arb]** | `Descriptive` | AC^0 | descriptive complexity, arbitrary numerical predicates |
| **FO** | `Descriptive` | U_DLOGTIME-AC^0 | Immerman's theorem |
| **FO(DTC)** | `Descriptive` | L | descriptive complexity, deterministic transitive closure |
| **FO(TC)** | `Descriptive` | NL | descriptive complexity, transitive closure |
| **FO(LFP)** | `Descriptive` | P | Immerman–Vardi theorem (ordered structures) |
| **SO∃** | `Descriptive` | NP | Fagin's theorem |
| **SO∀** | `Descriptive` | coNP | dual of Fagin's theorem |
| **SO** | `Descriptive` | PH | full second-order logic captures the polynomial hierarchy |
| **SO(TC)** | `Descriptive` | PSPACE | second-order logic with transitive closure |
| **SO(LFP)** | `Descriptive` | EXP | second-order logic with least-fixed-point |
| **U_DLOGTIME-AC** | `Circuit` (same as U_DLOGTIME-NC) | U_DLOGTIME-NC | full hierarchies coincide at the union/limit level, uniform case |
| **U_DLOGTIME-SAC** | `Circuit` (same as U_DLOGTIME-NC) | U_DLOGTIME-NC | full hierarchies coincide at the union/limit level, uniform case |
| **LOGCFL** | `Reducibility` | U_DLOGTIME-SAC^1 | Venkateswaran '91, uniform case |
| **LOGCFL/poly** | `Reducibility` | SAC^1 | Venkateswaran '91 (`LOGCFL = SAC^1`), advice ⇔ non-uniformity |

AC is the one entry in this table *not* modeled differently from what it equals — fan-in boundedness (the actual distinction between AC and NC) isn't a tracked property axis, so both get `Model: Circuit`. This mirrors how NC^i/AC^i pairs at any fixed finite level are likewise only distinguished via Inclusion, not Model — the difference for AC/NC is that, unlike those finite-level pairs (which are genuinely distinct, not proven equal), the `equivalentClassIds` link here also makes their Inclusion compare as `equal`, not just adjacent.

## Classes currently included

The current roster is placeholder data used to exercise the full stack end to end, **not** the final class list. Grouped by Model (proven-equal classes are noted inline, but each is its own roster entry — see the table above):

- **TM**: DLOGTIME, L, SC, P, FP, PSPACE, EXP, EXPSPACE, TD (aka R), TR (aka RE), coTR (aka coRE)
- **NTM**: NL, UL, NP, UP, NEXP, #P, #L, FNP, NPSPACE (≡ PSPACE), NEXPSPACE (≡ EXPSPACE), NP/poly, NL/poly
- **ATM**: ALOGTIME, coNP, AL (≡ P), AP (≡ PSPACE), APSPACE (≡ EXP), coNL (≡ NL), Σ_2^P, Π_2^P, PH, LH (≡ U_DLOGTIME-AC^0)
- **PTM**: ZPP, RP, coRP, BPP, PP, RL, coRL, BPL, PL, FBPP
- **Quantum**: BQP, QIP (≡ PSPACE), QMIP (≡ TR), MIP\* (≡ TR), QMA, QAM, FBQP
- **TM with Oracle**: P^#P, P^PP (≡ P^#P), Σ_2^P, Π_2^P, PH, AH
- **Interactive**: IP (≡ PSPACE), QIP (≡ PSPACE), MIP (≡ NEXP), QMIP (≡ TR), MIP\* (≡ TR), MA, AM, QMA, QAM, PZK, SZK, CZK, PCP(log,1) (≡ NP), PCP(poly,poly) (≡ MIP)
- **TM with Advice**: P/log, L/log, L/poly, EXP/poly
- **Reducibility**: LOGCFL (≡ U_DLOGTIME-SAC^1), LOGCFL/poly, DET
- **Descriptive**: FO[Arb] (≡ AC^0), FO (≡ U_DLOGTIME-AC^0), FO(DTC) (≡ L), FO(TC) (≡ NL), FO(LFP) (≡ P), SO∃ (≡ NP), SO∀ (≡ coNP), SO (≡ PH), SO(TC) (≡ PSPACE), SO(LFP) (≡ EXP)
- **Circuit / Non-Uniform**: NC^0, AC^0, ACC^0 (aka ACC), TC^0, NC^1, AC^1, NC^2, AC^2, SAC^0, SAC^1, SAC (≡ NC), NC, AC (≡ NC), P/poly, #AC^0
- **Circuit / DLOGTIME-Uniform**: U_DLOGTIME-NC^0, U_DLOGTIME-NC^1 (≡ ALOGTIME), U_DLOGTIME-NC^2, U_DLOGTIME-NC, U_DLOGTIME-AC^0 (≡ LH), U_DLOGTIME-ACC^0, U_DLOGTIME-TC^0, U_DLOGTIME-AC^1, U_DLOGTIME-AC^2, U_DLOGTIME-AC (≡ U_DLOGTIME-NC), U_DLOGTIME-SAC^0, U_DLOGTIME-SAC^1 (≡ LOGCFL), U_DLOGTIME-SAC (≡ U_DLOGTIME-NC)

("Circuit / Non-Uniform" merges what are actually two distinct Model tags in the code — P/poly's Model is `["Circuit", "TM with Advice"]`, kept as two separate values there since a class can carry multiple valid tags. This merge is purely a README presentation choice for readability; the underlying data and comparison logic still treat them as distinct.)

**Non-uniform circuits (NC/AC/ACC/TC/SAC).** NC^0–NC^2, AC^0–AC^2, ACC^0, TC^0, SAC^0/SAC^1/SAC, and NC/AC are all `Uniformity: Non-Uniform`. This matters: "NC ⊆ P" needs uniformity to hold (a non-uniform circuit family can smuggle in undecidable information via circuit selection), so these link to the rest of the roster only via `NC ⊆ P/poly`. The internal chain `NC^0 ⊆ AC^0 ⊆ ACC^0 ⊆ TC^0 ⊆ NC^1 ⊆ AC^1 ⊆ NC^2 ⊆ AC^2 ⊆ NC` and the semi-unbounded-fan-in sandwich `NC^i ⊆ SAC^i ⊆ AC^i` are purely structural circuit-simulation facts, so they hold regardless of uniformity. `SAC ≡ NC ≡ AC` (union-level collapse). Whether any of these are *strict* is mostly open (e.g. `ACC^0 = NC^1` is unresolved) — only established containments are encoded.

**DLOGTIME-uniform circuits (U_DLOGTIME-\*).** Mirrors the non-uniform ladder exactly (`U_DLOGTIME-NC^i ⊆ U_DLOGTIME-SAC^i ⊆ U_DLOGTIME-AC^i ⊆ U_DLOGTIME-NC^{i+1}`, with ACC^0/TC^0 slotted between AC^0 and NC^1), and each level is also `⊆` its own non-uniform counterpart. Because it's genuinely uniform, it gets containments the non-uniform version can't: `U_DLOGTIME-NC^1 ⊆ L ⊆ NL ⊆ U_DLOGTIME-NC^2` and `U_DLOGTIME-NC ⊆ P`. `U_DLOGTIME-NC^1 ≡ ALOGTIME` and `U_DLOGTIME-AC ≡ U_DLOGTIME-SAC ≡ U_DLOGTIME-NC` (Barrington–Immerman–Straubing).

**Descriptive complexity (FO/SO/LH).** `Descriptive`-tagged — defined by a logic, not a machine. `FO[Arb] ≡ AC^0`; `FO ≡ U_DLOGTIME-AC^0` (Immerman's theorem); `FO(DTC) ≡ L`; `FO(TC) ≡ NL`; `FO(LFP) ≡ P` (Immerman–Vardi, ordered structures only, glossed over here). `SO∃ ≡ NP` / `SO∀ ≡ coNP` (Fagin's theorem); `SO ≡ PH`; `SO(TC) ≡ PSPACE`; `SO(LFP) ≡ EXP`. LH (the LOGTIME hierarchy, `ATM`-tagged) `≡ U_DLOGTIME-AC^0` (Barrington–Immerman–Straubing), so `LH ⊆ ALOGTIME` follows transitively. (SO∃/SO∀ needed a small `latex.ts` addition so `\exists`/`\forall` render outside the bold wrapper — the same text-mode issue Σ/Π have.)

**Reducibility classes (LOGCFL, DET).** `Reducibility`-tagged — logspace many-one reducible to a fixed problem (a CFL for LOGCFL, the determinant for DET), one level above NL. `LOGCFL = SAC^1` (Venkateswaran) only holds in the **uniform** setting, so it's `LOGCFL ≡ U_DLOGTIME-SAC^1`, not plain (non-uniform) SAC^1. LOGCFL/poly *is* `≡ SAC^1` (non-uniform) — the advice supplies exactly the missing non-uniform power. LOGCFL and DET are otherwise incomparable.

**Log-space variants (RL, coRL, BPL, PL, SC, UL, UP).** RL/coRL/BPL/PL are the randomized analogues of RP/coRP/BPP/PP one level down (`PTM`); no edge between RL and coRL (open, like RP/coRP). SC ("Steve's Class") is simultaneous poly-time-and-polylog-space (`L ⊆ SC ⊆ P`; `BPL ⊆ SC` via Nisan's PRG). UL/UP are the unambiguous (≤1 accepting path) versions of NL/NP (`L ⊆ UL ⊆ NL`, `P ⊆ UP ⊆ NP`).

**Function/counting classes (FP, FNP, FBPP, FBQP, #P, #L, #AC^0).** `Type: Function` — these output a value or count, not a yes/no answer, so none have an Inclusion edge to any `Decision`-type class. FP/FNP/FBPP/FBQP mirror P/NP/BPP/BQP's containments; #L and #AC^0 are `⊆ #P` (an NL machine or AC^0 circuit is trivially a #P machine too).

**Polynomial hierarchy & oracle classes.** Σ_2^P/Π_2^P carry both `TM with Oracle` and `ATM` (two equally standard characterizations); PH inherits both. `PH ⊆ P^#P` (Toda's theorem) supersedes a direct `PH ⊆ PSPACE` edge. `P^PP ≡ P^#P` (a PP oracle and a #P oracle simulate each other via binary search/thresholding).

**Advice classes (P/log, P/poly, L/log, L/poly, NP/poly, NL/poly, EXP/poly).** All `Uniformity: Non-Uniform` — any advice is itself non-uniformity, whether or not there's a matching circuit-family proof. `BPP ⊆ P/poly` and `BPL ⊆ L/poly` (Adleman's theorem, and the same argument one level down) are unconditional. `AM ⊆ NP/poly` (the Adleman-style argument adapted to public coins) and `NL/poly ⊆ SAC^1` round out the nondeterministic-advice pair.

**Quantum & interactive-proof classes (BQP, QIP, QMIP, MIP\*).** `BPP ⊆ BQP ⊆ PP` (Adleman–DeMarrais–Huang). QIP/QMIP/MIP\* extend IP/MIP with quantum messages: `QIP ≡ PSPACE` (Jain–Ji–Upadhyay–Watrous), while `QMIP ≡ MIP* ≡ TR` (Ji–Natarajan–Vidick–Wright–Yuen) — entanglement between provers is dramatically more powerful than plain MIP (≡ NEXP).

**Arthur-Merlin, zero-knowledge & PCP classes.** MA/AM/QMA/QAM are each their own equivalence group: `NP, BPP ⊆ MA ⊆ AM ⊆ Π_2^P` (Babai) and `MA ⊆ Σ_2^P` (Sipser–Lautemann-style); `MA, BQP ⊆ QMA ⊆ QAM`, `AM ⊆ QAM`, `QMA ⊆ PP` (Kitaev–Watrous). `PZK ⊆ SZK ⊆ CZK ⊆ IP` is a strict definitional chain; `BPP ⊆ PZK` and `SZK ⊆ AM` (Fortnow / Aiello–Håstad). `PCP(log,1) ≡ NP` and `PCP(poly,poly) ≡ MIP` (the PCP theorem, Arora–Safra / Arora–Lund–Motwani–Sudan–Szegedy) — despite near-identical names, they land at very different points in the hierarchy.

**Computability ceiling (TD, TR, coTR, AH).** R/RE/coRE are plain aliases on TD/TR/coTR, not separate entries. `EXPSPACE ⊆ TD ⊆ {TR, coTR}`; no edge between TR and coTR (RE ≠ coRE, the halting problem). AH sits above both, `TM with Oracle`-tagged like PH.

The full roster is intended to eventually cover most of the [Complexity Zoo](https://complexityzoo.net/Complexity_Zoo). Adding a class means adding an entry to `CLASSES` and, if it participates in new containment relationships, an edge in `INCLUSION_EDGES`, both in [src/repositories/complexityClassRepository.ts](src/repositories/complexityClassRepository.ts) — this is the one file that owns all class/property data.

## Tech stack

- **Backend**: TypeScript + Express, server-rendered HTML (no client-side framework/bundle).
- **Frontend interactivity**: [HTMX](https://htmx.org/) — guesses are submitted via form POSTs and the server returns HTML fragments that swap into the DOM (`#game-board`, `#game-content`).
- **Styling**: Tailwind CSS v4, compiled via the standalone `@tailwindcss/cli` (no PostCSS/bundler step) from `src/styles/input.css` to `public/styles.css`.
- **Math typesetting**: class names (e.g. `NC^1`, `P^#P`) are rendered to KaTeX HTML **server-side** via the `katex` npm package (see [src/views/latex.ts](src/views/latex.ts)), not re-parsed client-side after every htmx swap. An earlier client-side approach (shipping raw LaTeX source with the CDN `auto-render` extension, re-scanning after each `htmx:afterSettle`) was reliable on static page loads but intermittently mis-rendered content after live htmx swaps specifically — the root cause wasn't pinned down (neither `event.target` vs. a fresh `document.body` lookup, nor added delay before re-scanning, fixed it reliably). Rendering server-side sidesteps the whole class of bug and needs no client-side KaTeX JS at all — only `katex.min.css` (CDN) for styling the server-emitted markup.

## Architecture

Layered, with each layer only talking to the one below it:

```
src/
  domain/          Shared types: Property, ComplexityClass, Game
  repositories/     ComplexityClassRepository (class/property data + comparison logic)
                     GameRepository (in-memory session/game state)
  services/         GameService — all game rules (daily/practice creation, guess evaluation, win/loss)
  controllers/       GameController — thin HTTP glue between routes and service/views
  views/             Pure functions returning HTML strings (layout, homeView, gameBoardView)
  routes/             Path wiring only
  middleware/         Cookie-based session id
  config/             Environment config
  app.ts              Composition root (wires repositories → service → controller → routes)
  server.ts           Entry point
public/styles.css      Generated by Tailwind — do not hand-edit
```

Game state (both daily and practice) is in-memory per session, keyed by a cookie-based session id — it resets if the server restarts.

## Running it

```bash
npm install
npm run dev     # runs the server (tsx watch) and the Tailwind watcher together
```

Then visit `http://localhost:3000`.

Other scripts:

```bash
npm run build    # compiles CSS (minified) then TypeScript, to dist/
npm start        # runs the compiled server from dist/
```
