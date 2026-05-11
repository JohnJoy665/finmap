import type { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schemas";
import { registerUser, loginUser } from "./auth.service";


export async function registerController(req: Request, res: Response) {
  const { error, value } = registerSchema.validate(req.body);

  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  try {
    const user = await registerUser(value);

    res.status(201).json({ user });
  } catch (err) {
    res.status(400).json({
      message: err instanceof Error ? err.message : "Registration error",
    });
  }
}

export async function loginController(req: Request, res: Response) {
    const { error, value } = loginSchema.validate(req.body);
  
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }
  
    try {
      const result = await loginUser(value);
  
      res.json(result);
    } catch (err) {
      res.status(401).json({
        message: err instanceof Error ? err.message : "Login error",
      });
    }
  }