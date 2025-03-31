import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Define a custom payload interface that extends JwtPayload and includes userId
interface CustomJwtPayload extends JwtPayload {
  userId: string;
}
interface CustomRequest extends Request {
  userId?: string;
}

const verifyToken = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Check if Authorization header is present
    if (!req.headers.authorization) {
      return res.status(403).json({
        success: false,
        message: "Authorization header is missing",
        errorMessage: "Authorization key must be added in header",
      });
    }

    const authHeader = req.headers.authorization;

    // Verify token synchronously
    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET as string) as CustomJwtPayload;

    // Save the user ID from the token
    req.userId = decoded.userId;

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to authenticate token",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

export default verifyToken;
