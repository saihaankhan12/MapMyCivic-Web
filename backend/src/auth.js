import jwt from "jsonwebtoken";
import { config } from "./config.js";

export function createToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export function requireAdminAuth(request, response, next) {
  const header = request.headers.authorization ?? "";

  if (!header.startsWith("Bearer ")) {
    response.status(401).json({ message: "Admin authentication required." });
    return;
  }

  try {
    const token = header.slice("Bearer ".length);
    request.auth = verifyToken(token);
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired admin token." });
  }
}
