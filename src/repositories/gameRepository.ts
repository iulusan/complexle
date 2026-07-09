import { GameMode, GameState } from "../domain/game";

export class GameRepository {
  private readonly dailyGames = new Map<string, GameState>();
  private readonly practiceGames = new Map<string, GameState>();

  getGame(sessionId: string, mode: GameMode): GameState | undefined {
    return this.gamesFor(mode).get(sessionId);
  }

  setGame(sessionId: string, mode: GameMode, game: GameState): void {
    this.gamesFor(mode).set(sessionId, game);
  }

  private gamesFor(mode: GameMode): Map<string, GameState> {
    return mode === "daily" ? this.dailyGames : this.practiceGames;
  }
}
