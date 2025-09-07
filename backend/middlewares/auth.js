import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  // Expecting header: Authorization: Bearer <token>
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access Denied. No token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" }); // ❌ you had empty string here
  }
};
