import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthTokenClaims } from "../../Domain/types/AuthTokenClaims";

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenClaims;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Token nije prosleđen!",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        message: "JWT secret nije konfigurisan!",
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as AuthTokenClaims;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Neispravan token!",
    });
  }
};