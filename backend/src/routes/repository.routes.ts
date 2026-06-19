import { Router } from "express";

import { 
  analyzeRepositoryController,
  analyzeRepositoryStreamController,
  analyzeZipStreamController,
  zipUpload,
  listRepositoriesController, 
  getRepositorySummaryController,
  getCommitSummaryController
} from "../controllers/repository.controller";

const repositoryRoutes = Router();

repositoryRoutes.get("/", listRepositoriesController);
repositoryRoutes.post("/analyze", analyzeRepositoryController);
repositoryRoutes.post("/analyze/stream", analyzeRepositoryStreamController);
repositoryRoutes.post("/upload/stream", zipUpload.single("zipFile"), analyzeZipStreamController);
repositoryRoutes.get("/:namespace/summary", getRepositorySummaryController);
repositoryRoutes.get("/:namespace/commits/summary", getCommitSummaryController);

export default repositoryRoutes;
