import jwt from "jsonwebtoken";

export function verifyJWT(req) {
  try {
    const bearer = req.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
    const token = bearer || req.cookies.get("token")?.value;
    if (!token || !process.env.JWT_SECRET) return null;
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return user?.id && ["Student", "Teacher"].includes(user.role) ? user : null;
  } catch {
    return null;
  }
}

export function signJWT(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
  return jwt.sign({ id: String(user._id), username: user.username, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function requireRole(request, role) {
  const user = verifyJWT(request);
  if (!user) return { status: 401, message: "Please log in." };
  if (role && user.role !== role) return { status: 403, message: "Access denied." };
  return { user };
}
