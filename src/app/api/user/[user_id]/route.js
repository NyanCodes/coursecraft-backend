import { getDatabase } from "../../../../lib/mongodb";
import { requireRole } from "../../../../lib/auth";
import { objectId } from "../../../../lib/course";
import { fail, json, options, serverError } from "../../../../lib/utils";

export const OPTIONS = options;
export async function GET(request, { params }) {
  const auth = requireRole(request);
  if (!auth.user) return fail(request, auth.message, auth.status);
  const id = objectId((await params).user_id);
  if (!id) return fail(request, "Invalid user ID.");
  if (String(id) !== auth.user.id) return fail(request, "Access denied.", 403);
  try {
    const db = await getDatabase();
    const user = await db.collection("users").findOne({ _id: id }, { projection: { password: 0 } });
    if (!user) return fail(request, "User not found.", 404);
    return json(request, { user: { id: String(user._id), username: user.username, email: user.email, role: user.role } });
  } catch (error) { return serverError(request, error); }
}
