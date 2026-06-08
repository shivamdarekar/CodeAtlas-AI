import cors from "cors";
import express from "express";

import repositoryRoutes from "./routes/repository.routes";
import { errorHandler } from "./middlewares/error-handler";
import { ApiError } from "./utils/api-error";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (_request, response) => {
	response.json({
		message: "Codebase Assistant backend is running",
	});
});

app.get("/health", (_request, response) => {
	response.json({ status: "ok" });
});

app.use("/api/v1/repos", repositoryRoutes);

app.use((_request, _response, next) => {
	next(new ApiError(404, "Route not found"));
});

app.use(errorHandler);

export default app;
