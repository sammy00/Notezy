import express from "express";
import fetchuser from "../middleware/fetchuser";
import { addTask, deleteTask, fetchTasks, updateTask } from "../controllers/task.controller";

const router = express.Router();

router.get("/", fetchuser, fetchTasks);
router.post("/", fetchuser, addTask);
router.patch("/:id", fetchuser, updateTask);
router.delete("/:id", fetchuser, deleteTask);

export default router;
