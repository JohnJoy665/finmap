import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes";
import { authMiddleware } from "./middlewares/authMiddleware";
import { userRouter } from "./modules/user/user.routes";
import { profileRouter } from "./modules/profile/profile.routes";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import { categoriesRouter } from "./modules/category/category.routes";
import { groupsRouter } from "./modules/groups/groups.routers";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);

app.use("/api", authMiddleware);

app.use("/api", profileRouter);
app.use("/api", userRouter);
app.use("/api", categoriesRouter);
app.use("/api/groups", groupsRouter);

app.use(errorMiddleware);

export default app;
