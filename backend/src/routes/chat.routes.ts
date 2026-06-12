import { Router } from "express";

import { chatController } from "../controllers/chat.controller";

const chatRoutes = Router({ mergeParams: true });

chatRoutes.post("/", chatController);

export default chatRoutes;
