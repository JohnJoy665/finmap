import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes";
import { authMiddleware } from "./middlewares/authMiddleware";
import { userRouter } from "./modules/user/user.routes";
import { profileRouter } from "./modules/profile/profile.routes";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import { categoriesRouter } from "./modules/category/category.routes";
import { groupsRouter } from "./modules/groups/groups.routers";
import { userSettingsMiddleware } from "./middlewares/userSettingsMiddleware";
import { spendingsRouter } from "./modules/spendings/spendings.routers";
import { languagesRouter } from "./modules/languages/languages.routers";
import { geoPositionRouter } from "./modules/geoPositions/geoPosition.routers";
import { countriesRouter } from "./modules/countries/countries.routers";
import { citiesRouter } from "./modules/cities/cities.routers";
import { currenciesRouter } from "./modules/currencies/currencies.routers";
import { accountsRouter } from "./modules/accounts/accounts.routers";
import { environmentsRouter } from "./modules/environments/environmentsRouter";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);

app.use("/api", authMiddleware);

app.use("/api/me", userRouter);
app.use("/api/languages", languagesRouter);
app.use("/api/profile", profileRouter);
app.use("/api/geoPosition", geoPositionRouter);
app.use("/api/countries", countriesRouter);
app.use("/api/cities", citiesRouter);
app.use("/api/currencies", currenciesRouter);

app.use("/api", userSettingsMiddleware);

app.use("/api/accounts", accountsRouter);
app.use("/api/environments", environmentsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/spendings", spendingsRouter);

app.use(errorMiddleware);

export default app;
