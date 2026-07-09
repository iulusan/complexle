import cookieParser from "cookie-parser";
import express, { Express } from "express";
import path from "path";
import { GameController } from "./controllers/gameController";
import { sessionMiddleware } from "./middleware/session";
import { ComplexityClassRepository } from "./repositories/complexityClassRepository";
import { GameRepository } from "./repositories/gameRepository";
import { createGameRoutes } from "./routes/gameRoutes";
import { GameService } from "./services/gameService";

export function createApp(): Express {
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(sessionMiddleware);
  app.use(express.static(path.join(__dirname, "..", "public")));

  const classRepository = new ComplexityClassRepository();
  const gameRepository = new GameRepository();
  const gameService = new GameService(classRepository, gameRepository);
  const gameController = new GameController(gameService, classRepository);

  app.use(createGameRoutes(gameController));

  return app;
}
