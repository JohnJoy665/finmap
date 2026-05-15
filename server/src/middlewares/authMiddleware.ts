import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

type JwtPayload = {
  userId: string;
};

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // console.log("auth middleware started");

  const authHeader = req.headers.authorization;
  // console.log("authHeader:", authHeader);

  if (!authHeader) {
    //   console.log("no token");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  // console.log("token:", token);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    //   console.log("decoded:", decoded);

    req.user = decoded;

    next();
  } catch {
    //   console.log("invalid token");
    return res.status(401).json({ message: "Invalid token" });
  }
}
