import bcrypt from "bcrypt";
import { pool } from "../../db/pool";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";

type RegisterDto = {
  name: string;
  email: string;
  password: string;
};

type LoginDto = {
  email: string;
  password: string;
};

export async function registerUser({ name, email, password }: RegisterDto) {
  // throw new Error("Tihs operation is not alowed yet");
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("User with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email
    `,
    [name, email, passwordHash]
  );

  return result.rows[0];
}

export async function loginUser({ email, password }: LoginDto) {
  const result = await pool.query(
    `
        SELECT id, name, email, password_hash
        FROM users
        WHERE email = $1
      `,
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    throw new AppError(
      401,
      "INVALID EMAIL OR PASSWORD",
      "Invalid email or password"
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new AppError(
      401,
      "INVALID EMAIL OR PASSWORD",
      "Invalid email or password"
    );
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}
