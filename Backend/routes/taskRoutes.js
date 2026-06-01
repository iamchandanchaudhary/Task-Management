import express from "express";
import { createTask, getMyTasks } from "../controllers/taskController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", verifyToken, getMyTasks);
router.post("/", verifyToken, createTask);

export default router;
