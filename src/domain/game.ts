import { CategoricalComparison, OrderComparison, PropertyKind } from "./property";

export type GameMode = "daily" | "practice";
export type GameStatus = "in-progress" | "won" | "lost";

export interface PropertyFeedback {
  propertyId: string;
  label: string;
  kind: PropertyKind;
  result: OrderComparison | CategoricalComparison;
  /** Display value: the guessed class's own attribute, formatted for display. Absent for partial-order. */
  value?: string;
}

export interface GuessResult {
  classId: string;
  className: string;
  correct: boolean;
  properties: PropertyFeedback[];
}

export interface GameState {
  id: string;
  mode: GameMode;
  targetClassId: string;
  maxGuesses: number;
  status: GameStatus;
  guesses: GuessResult[];
  /** Set for daily games; used to detect when a new day's puzzle should replace this one. */
  dateKey?: string;
}
