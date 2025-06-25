import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const protect = (req: Request, res: Response, next: NextFunction) => {
  req.userId = "60d0fe4f5311236168a109ca";

  if (!req.userId) {
    return res
      .status(401)
      .json({ message: "Not authorized, no user ID found" });
  }

  next();
};

export { protect };
