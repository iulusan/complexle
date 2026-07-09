# Complexle

Complexle is a Wordle-style guessing game — but instead of guessing a five-letter word, you're guessing a **computational complexity class**, like P, NP, or PSPACE. Every guess tells you how it relates to the secret class across a handful of properties, so you can close in on the answer guess by guess.

## How to play

- **Daily**: everyone gets the same secret class each day.
- **Practice**: unlimited random classes — hit "New practice game" to try another.
- Type a class name (or a well-known nickname for it) into the box. Suggestions pop up as you type, so you don't need to remember exact spelling or capitalization.
- You get **6 guesses**. Every property is revealed for every guess — nothing is hidden or doled out gradually, so you always have full information to plan your next guess.
- Some classes go by more than one name because they're mathematically *proven* to be exactly the same class — guessing either name wins. For example, IP and PSPACE are proven equal, so if the secret class is IP, guessing "PSPACE" wins too.
- If what you type doesn't match a known class, you'll get an error and it won't cost you a guess. Guessing the same class twice is likewise free (but pointless).

## Reading the clues

Each guess shows a row of colored cells, one per property, telling you how that property compares to the secret class:

- **Inclusion** — is your guess a *smaller* class, a *larger* class, or does it have no known containment relationship with the secret class at all ("Incomparable")?
- **Model** — what kind of "computer" defines the class: an ordinary machine, a machine that guesses (nondeterministic), a machine that flips coins (probabilistic), a circuit, a quantum computer, an interactive back-and-forth between a prover and a verifier, "everything reducible to a fixed problem," a logical formula, and so on. A class can match on more than one of these if it has more than one valid description.
- **Type** — is it a yes/no decision problem, a function problem (including counting problems, like #P), or a communication problem?
- **Advice** — how much extra "cheat sheet" information (if any) the class's machine is allowed to have per input length, from none up to unbounded.
- **Uniformity** — for circuit-based classes, how simple the rule generating the circuits has to be. Shows "N/A" for classes that aren't defined by a circuit family at all — that's not a rank, just "this question doesn't apply here."
- **Oracle** — does the class's definition get to "ask questions" of another class for free, and if so, does asking itself change anything?
- **Promise** — is the class defined for every possible input, or only over a restricted set of inputs?

When a clue isn't an exact match, it tells you which way to move your *next* guess (e.g. "Larger", "More Advice", "More Uniform") rather than just describing where your last guess landed — think of it as pointing, not just reporting.

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Classes currently in the game

- DLOGTIME
- ALOGTIME
- L (aka LOGSPACE)
- L/log
- L/poly
- NL/poly
- RL
- coRL
- BPL
- PL
- SC
- UL
- NL
- coNL
- LOGCFL
- LOGCFL/poly
- DET
- NC^0
- AC^0
- ACC^0 (aka ACC)
- TC^0
- NC^1
- AC^1
- NC^2
- AC^2
- U_DLOGTIME-NC^0
- U_DLOGTIME-NC^1
- U_DLOGTIME-NC^2
- U_DLOGTIME-NC
- U_DLOGTIME-AC^0
- U_DLOGTIME-AC^1
- U_DLOGTIME-AC^2
- U_DLOGTIME-AC
- U_DLOGTIME-ACC^0
- U_DLOGTIME-TC^0
- U_DLOGTIME-SAC^0
- U_DLOGTIME-SAC^1
- U_DLOGTIME-SAC
- LH
- FO[Arb]
- FO
- FO(DTC)
- FO(TC)
- FO(LFP)
- SO∃
- SO∀
- SO
- SO(TC)
- SO(LFP)
- SAC^0
- SAC^1
- SAC
- NC
- AC
- P
- AL
- ZPP
- RP
- coRP
- NP
- UP
- coNP
- BPP
- BQP
- PP
- P^#P
- P^PP
- MA
- AM
- QMA
- QAM
- Σ_2^P
- Π_2^P
- PH
- P/log
- P/poly
- NP/poly
- PSPACE
- AP
- NPSPACE
- #P
- #L
- #AC^0
- FP
- FNP
- FBPP
- FBQP
- IP
- QIP
- PZK
- SZK
- CZK
- PCP(log,1)
- PCP(poly,poly)
- EXP (aka EXPTIME)
- EXP/poly
- APSPACE
- NEXP (aka NEXPTIME)
- EXPSPACE
- NEXPSPACE
- MIP
- QMIP
- MIP*
- TD (aka R)
- TR (aka RE)
- coTR (aka coRE)
- AH

More classes are being added over time.

---

Looking for the property definitions, the current class roster, or how the game is built? See [PROJECT.md](PROJECT.md).
