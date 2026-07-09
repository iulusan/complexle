import { Router } from "express";
import { GameController } from "../controllers/gameController";

export function createGameRoutes(controller: GameController): Router {
  const router = Router();

  router.get("/", (_req, res) => res.redirect("/games/daily"));
  router.get("/games/daily", controller.showDaily);
  router.get("/games/practice", controller.showPractice);
  router.post("/games/practice", controller.newPracticeGame);
  router.post("/games/:mode/guesses", controller.submitGuess);
  router.get("/suggestions", controller.searchSuggestions);

  return router;
}
