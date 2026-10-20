import { getDatabase } from "../../../lib/mongodb";
import { requireRole } from "../../../lib/auth";
import { fail, json, options, serverError } from "../../../lib/utils";

export const OPTIONS = options;
export async function GET(request) {
  const auth = requireRole(request);
  if (!auth.user) return fail(request, auth.message, auth.status);
  try {
    const db = await getDatabase();
    const user = await db.collection("users").findOne({ email: auth.user.email }, { projection: { password: 0 } });
    if (!user) return fail(request, "User not found.", 401);
    return json(request, { user: { id: String(user._id), username: user.username, email: user.email, role: user.role } });
  } catch (error) { return serverError(request, error); }
}
