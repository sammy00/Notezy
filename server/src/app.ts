import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import noteRoutes from "./routes/note.routes";
import taskRoutes from "./routes/task.routes";

const app = express();
const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : true;

app.use(cors({ origin: clientOrigins, credentials: true }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", app: "Notezy API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tasks", taskRoutes);

export default app;
