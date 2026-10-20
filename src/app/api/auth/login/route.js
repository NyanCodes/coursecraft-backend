import bcrypt from "bcrypt";
import { getDatabase } from "../../../../lib/mongodb";
import { signJWT } from "../../../../lib/auth";
import { fail, json, options, serverError } from "../../../../lib/utils";

export const OPTIONS = options;

export async function POST(request) {
  try {
    const body = await request.json();
    const identifier = String(body.identifier || "").trim();
    const password = String(body.password || "");
    if (!identifier || !password) return fail(request, "Enter your username or email and password.");
    const db = await getDatabase();
    const user = await db.collection("users").findOne({ $or: [{ username: identifier }, { email: identifier.toLowerCase() }] });
    if (!user || !(await bcrypt.compare(password, user.password))) return fail(request, "Invalid login details.", 401);
    return json(request, { token: signJWT(user), user: { id: String(user._id), username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    return error instanceof SyntaxError ? fail(request, "Invalid JSON.") : serverError(request, error);
  }
}
