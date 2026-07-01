import { Router } from "express";

import { chatController, chatStreamController } from "../controllers/chat.controller";

const chatRoutes = Router({ mergeParams: true });

chatRoutes.post("/", chatController);
chatRoutes.post("/stream", chatStreamController);

export default chatRoutes;
