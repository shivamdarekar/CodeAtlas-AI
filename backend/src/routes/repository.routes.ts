import { Router } from "express";

import { analyzeRepositoryController, listRepositoriesController } from "../controllers/repository.controller";

const repositoryRoutes = Router();

repositoryRoutes.get("/", listRepositoriesController);
repositoryRoutes.post("/analyze", analyzeRepositoryController);

export default repositoryRoutes;
