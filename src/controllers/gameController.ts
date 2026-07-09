import type { Request, Response } from "express";
import { ComplexityClassRepository } from "../repositories/complexityClassRepository";
import { GameService } from "../services/gameService";
import { gameBoardView } from "../views/gameBoardView";
import { gameContent, homeView } from "../views/homeView";
import { layout } from "../views/layout";
import { suggestionsView } from "../views/suggestionsView";

export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly classRepo: ComplexityClassRepository
  ) {}

  showDaily = (req: Request, res: Response): void => {
    const game = this.gameService.getOrCreateDailyGame(req.sessionId);
    const properties = this.classRepo.getPropertyDefinitions();
    const targetClassName = this.classRepo.findById(game.targetClassId)?.name ?? "";
    const classCount = this.classRepo.getAll().length;
    const aliasIndex = this.classRepo.getAliasIndex();
    res.send(layout("Complexle - Daily", homeView({ mode: "daily", game, properties, targetClassName, classCount, aliasIndex })));
  };

  showPractice = (req: Request, res: Response): void => {
    const game = this.gameService.getOrCreatePracticeGame(req.sessionId);
    const properties = this.classRepo.getPropertyDefinitions();
    const targetClassName = this.classRepo.findById(game.targetClassId)?.name ?? "";
    const classCount = this.classRepo.getAll().length;
    const aliasIndex = this.classRepo.getAliasIndex();
    res.send(layout("Complexle - Practice", homeView({ mode: "practice", game, properties, targetClassName, classCount, aliasIndex })));
  };

  newPracticeGame = (req: Request, res: Response): void => {
    const game = this.gameService.createPracticeGame(req.sessionId);
    const properties = this.classRepo.getPropertyDefinitions();
    const targetClassName = this.classRepo.findById(game.targetClassId)?.name ?? "";
    res.send(gameContent({ mode: "practice", game, properties, targetClassName }));
  };

  submitGuess = (req: Request, res: Response): void => {
    const mode = req.params.mode;
    if (mode !== "daily" && mode !== "practice") {
      res.status(404).end();
      return;
    }

    const guessText = String(req.body.guess ?? "");
    const { game, error } = this.gameService.submitGuess(req.sessionId, mode, guessText);
    const properties = this.classRepo.getPropertyDefinitions();
    const targetClassName = this.classRepo.findById(game.targetClassId)?.name ?? "";
    res.send(gameBoardView({ mode, game, properties, targetClassName, error }));
  };

  searchSuggestions = (req: Request, res: Response): void => {
    const query = String(req.query.guess ?? "");
    res.send(suggestionsView(this.classRepo.findMatches(query)));
  };
}
