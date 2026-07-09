import { randomUUID } from "crypto";
import { ComplexityClass } from "../domain/complexityClass";
import { GameMode, GameState, GuessResult, PropertyFeedback } from "../domain/game";
import { PropertyDefinition } from "../domain/property";
import { ComplexityClassRepository } from "../repositories/complexityClassRepository";
import { GameRepository } from "../repositories/gameRepository";

const MAX_GUESSES = 6;

export interface SubmitGuessResult {
  game: GameState;
  error?: string;
}

export class GameService {
  constructor(
    private readonly classRepo: ComplexityClassRepository,
    private readonly gameRepo: GameRepository
  ) {}

  getOrCreateDailyGame(sessionId: string): GameState {
    const todayKey = getTodayDateKey();
    const existing = this.gameRepo.getGame(sessionId, "daily");
    if (existing && existing.dateKey === todayKey) return existing;

    const game = this.createGame("daily", this.pickDailyTargetId(todayKey));
    game.dateKey = todayKey;
    this.gameRepo.setGame(sessionId, "daily", game);
    return game;
  }

  getOrCreatePracticeGame(sessionId: string): GameState {
    return this.gameRepo.getGame(sessionId, "practice") ?? this.createPracticeGame(sessionId);
  }

  createPracticeGame(sessionId: string): GameState {
    const classes = this.classRepo.getAll();
    const target = classes[Math.floor(Math.random() * classes.length)];
    const game = this.createGame("practice", target.id);
    this.gameRepo.setGame(sessionId, "practice", game);
    return game;
  }

  submitGuess(sessionId: string, mode: GameMode, guessText: string): SubmitGuessResult {
    const game = this.gameRepo.getGame(sessionId, mode);
    if (!game) throw new Error(`No ${mode} game in progress for this session.`);
    if (game.status !== "in-progress") return { game };

    const guessed = this.classRepo.findByGuessText(guessText);
    if (!guessed) return { game, error: `No complexity class matches "${guessText}".` };

    if (game.guesses.some((g) => g.classId === guessed.id)) {
      return { game, error: `You already guessed ${guessed.name}.` };
    }

    const target = this.classRepo.findById(game.targetClassId) as ComplexityClass;
    const result = this.evaluateGuess(guessed, target);
    game.guesses.push(result);

    if (result.correct) game.status = "won";
    else if (game.guesses.length >= game.maxGuesses) game.status = "lost";

    this.gameRepo.setGame(sessionId, mode, game);
    return { game };
  }

  getPropertyDefinitions(): PropertyDefinition[] {
    return this.classRepo.getPropertyDefinitions();
  }

  private evaluateGuess(guessed: ComplexityClass, target: ComplexityClass): GuessResult {
    const correct = this.classRepo.areEquivalent(guessed.id, target.id);
    // Properties are always evaluated against the literally-guessed class's own honest values —
    // even on a win via equivalence (e.g. guessing "PSPACE" when the target is IP) — so the hints
    // reflect what you actually typed, not the target's own properties.
    const properties = this.classRepo.getPropertyDefinitions().map((def) => this.evaluateProperty(def, guessed, target));
    return {
      classId: guessed.id,
      className: guessed.name,
      correct,
      properties,
    };
  }

  private evaluateProperty(def: PropertyDefinition, guessed: ComplexityClass, target: ComplexityClass): PropertyFeedback {
    switch (def.kind) {
      case "partial-order":
        return {
          propertyId: def.id,
          label: def.label,
          kind: def.kind,
          result: this.classRepo.compareOrder(def.id, guessed.id, target.id),
        };

      case "total-order":
        return {
          propertyId: def.id,
          label: def.label,
          kind: def.kind,
          result: this.classRepo.compareTotalOrder(def.id, guessed.id, target.id),
          value: this.classRepo.getTotalOrderValue(guessed.id, def.id),
        };

      case "categorical-multi":
        return {
          propertyId: def.id,
          label: def.label,
          kind: def.kind,
          result: this.classRepo.compareCategoricalSet(def.id, guessed.id, target.id),
          value: this.classRepo.getCategoricalSetValue(guessed.id, def.id).join(", ") || "none",
        };

      case "categorical": {
        const guessValue = this.classRepo.getCategoricalValue(guessed.id, def.id);
        const targetValue = this.classRepo.getCategoricalValue(target.id, def.id);
        return {
          propertyId: def.id,
          label: def.label,
          kind: def.kind,
          result: guessValue === targetValue ? "match" : "mismatch",
          value: guessValue ?? "unknown",
        };
      }
    }
  }

  private createGame(mode: GameMode, targetClassId: string): GameState {
    return {
      id: randomUUID(),
      mode,
      targetClassId,
      maxGuesses: MAX_GUESSES,
      status: "in-progress",
      guesses: [],
    };
  }

  private pickDailyTargetId(dateKey: string): string {
    const classes = this.classRepo.getAll();
    const hash = [...dateKey].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return classes[hash % classes.length].id;
  }
}

function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}
