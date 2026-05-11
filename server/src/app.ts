import express from "express";
import cors from "cors";
import { pool } from "./db/pool";
import { authRouter } from "./modules/auth/auth.routes";
import { authMiddleware } from "./middlewares/authMiddleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  const result = await pool.query("SELECT 1 as value");

  res.json({
    ok: true,
    message: "Finmap API is working",
    db: result.rows[0],
  });
});

app.get("/api/me", authMiddleware, (req, res) => {
    res.json({
      message: "You are authorized",
      user: (req as any).user,
    });
  });

app.use("/api/auth", authRouter);

export default app;