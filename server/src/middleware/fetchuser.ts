import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

const fetchuser = (req: Request, res: Response, next: NextFunction) => {
  const authToken = req.header("auth-token");
  const authorization = req.header("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const token = authToken || bearerToken;
  const devUserId = req.header("x-user-id");

  if (token) {
    try {
      const secret = process.env.JWT_SECRET;

      if (!secret) {
        res.status(500).json({ error: "JWT_SECRET is not configured." });
        return;
      }

      const decoded = jwt.verify(token, secret) as { user?: { id?: string } };
      const userId = decoded.user?.id;

      if (!userId) {
        res.status(401).json({ error: "Please authenticate using a valid token." });
        return;
      }

      (req as AuthenticatedRequest).user = { id: userId };
      next();
      return;
    } catch {
      res.status(401).json({ error: "Please authenticate using a valid token." });
      return;
    }
  }

  if (devUserId && process.env.NODE_ENV !== "production") {
    (req as AuthenticatedRequest).user = { id: devUserId };
    next();
    return;
  }

  res.status(401).json({ error: "Please authenticate using a valid token." });
};

export default fetchuser;
