import { GameMode, GameState } from "../domain/game";
import { GameRepository } from "../repositories/gameRepository";

const STORAGE_PREFIX = "complexle:";

/**
 * Browser stand-in for GameRepository's in-memory Maps — persists to localStorage instead, so a
 * refresh doesn't lose progress. Extends GameRepository (rather than just matching its public
 * shape) because GameRepository's private fields make it otherwise non-substitutable for
 * GameService, which takes a GameRepository directly.
 */
export class LocalStorageGameRepository extends GameRepository {
  override getGame(_sessionId: string, mode: GameMode): GameState | undefined {
    const raw = localStorage.getItem(this.key(mode));
    return raw ? (JSON.parse(raw) as GameState) : undefined;
  }

  override setGame(_sessionId: string, mode: GameMode, game: GameState): void {
    localStorage.setItem(this.key(mode), JSON.stringify(game));
  }

  private key(mode: GameMode): string {
    return `${STORAGE_PREFIX}${mode}`;
  }
}
