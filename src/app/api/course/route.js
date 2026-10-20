import { ObjectId } from "mongodb";
import { getDatabase } from "../../../lib/mongodb";
import { requireRole } from "../../../lib/auth";
import { courseInput, courseView } from "../../../lib/course";
import { fail, json, options, serverError } from "../../../lib/utils";

export const OPTIONS = options;

export async function GET(request) {
  const auth = requireRole(request);
  if (!auth.user) return fail(request, auth.message, auth.status);
  try {
    const db = await getDatabase();
    const query = auth.user.role === "Teacher"
      ? { teacherId: new ObjectId(auth.user.id) }
      : { status: { $ne: "Cancel" } };
    if (auth.user.role === "Student" && new URL(request.url).searchParams.get("enrolled") === "true") {
      query.studentIds = new ObjectId(auth.user.id);
    }
    const search = new URL(request.url).searchParams.get("search")?.trim();
    if (auth.user.role === "Student" && search) {
      const pattern = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [{ name: { $regex: pattern, $options: "i" } }, { teacherName: { $regex: pattern, $options: "i" } }];
    }
    const courses = await db.collection("courses").find(query).sort({ createdAt: -1 }).toArray();
    return json(request, { courses: courses.map((course) => courseView(course)) });
  } catch (error) { return serverError(request, error); }
}

export async function POST(request) {
  const auth = requireRole(request, "Teacher");
  if (!auth.user) return fail(request, auth.message, auth.status);
  try {
    const input = courseInput(await request.json());
    if (!input) return fail(request, "Enter a name, at least one topic, valid duration, price, seats, and status.");
    const db = await getDatabase();
    const teacherId = new ObjectId(auth.user.id);
    const teacher = await db.collection("users").findOne({ _id: teacherId, role: "Teacher" });
    if (!teacher) return fail(request, "Teacher not found.", 401);
    const course = { ...input, teacherId, teacherName: teacher.username, studentIds: [], createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection("courses").insertOne(course);
    return json(request, { course: courseView({ ...course, _id: result.insertedId }) }, 201);
  } catch (error) { return error instanceof SyntaxError ? fail(request, "Invalid JSON.") : serverError(request, error); }
}
