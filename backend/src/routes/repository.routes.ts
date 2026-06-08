import { Router } from "express";

import { analyzeRepositoryController } from "../controllers/repository.controller";

const repositoryRoutes = Router();

repositoryRoutes.post("/analyze", analyzeRepositoryController);

export default repositoryRoutes;
