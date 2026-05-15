import type { UserSettings } from "./middlewares/userSettings.types";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
      userSettings?: UserSettings;
    }
  }
}

export {};
