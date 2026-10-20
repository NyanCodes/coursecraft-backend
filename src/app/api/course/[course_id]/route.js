import { ObjectId } from "mongodb";
import { getDatabase } from "../../../../lib/mongodb";
import { requireRole } from "../../../../lib/auth";
import { courseInput, courseView, objectId } from "../../../../lib/course";
import { fail, json, options, serverError } from "../../../../lib/utils";

export const OPTIONS = options;

async function context(request, params) {
  const auth = requireRole(request);
  if (!auth.user) return { error: fail(request, auth.message, auth.status) };
  const id = objectId((await params).course_id);
  if (!id) return { error: fail(request, "Invalid course ID.") };
  const db = await getDatabase();
  const course = await db.collection("courses").findOne({ _id: id });
  if (!course) return { error: fail(request, "Course not found.", 404) };
  if (auth.user.role === "Teacher" && String(course.teacherId) !== auth.user.id) return { error: fail(request, "Access denied.", 403) };
  if (auth.user.role === "Student" && course.status === "Cancel") return { error: fail(request, "Course not found.", 404) };
  return { db, course, id, user: auth.user };
}

export async function GET(request, { params }) {
  try {
    const data = await context(request, params);
    if (data.error) return data.error;
    let students;
    if (data.user.role === "Teacher") {
      const users = await data.db.collection("users").find({ _id: { $in: data.course.studentIds || [] } }, { projection: { username: 1, email: 1 } }).toArray();
      students = users.map((user) => ({ id: String(user._id), username: user.username, email: user.email }));
    }
    return json(request, { course: courseView(data.course, students) });
  } catch (error) { return serverError(request, error); }
}

export async function PUT(request, { params }) {
  try {
    const data = await context(request, params);
    if (data.error) return data.error;
    if (data.user.role !== "Teacher") return fail(request, "Access denied.", 403);
    const input = courseInput(await request.json());
    if (!input) return fail(request, "Enter valid course details.");
    if (input.maxStudents < (data.course.studentIds?.length || 0)) return fail(request, "Max students cannot be below current enrollment.");
    const result = await data.db.collection("courses").findOneAndUpdate(
      { _id: data.id, teacherId: new ObjectId(data.user.id), $expr: { $lte: [{ $size: "$studentIds" }, input.maxStudents] } },
      { $set: { ...input, updatedAt: new Date() } }, { returnDocument: "after" },
    );
    if (!result) return fail(request, "Course changed. Refresh and try again.", 409);
    return json(request, { course: courseView(result) });
  } catch (error) { return error instanceof SyntaxError ? fail(request, "Invalid JSON.") : serverError(request, error); }
}

export async function DELETE(request, { params }) {
  try {
    const data = await context(request, params);
    if (data.error) return data.error;
    if (data.user.role !== "Teacher") return fail(request, "Access denied.", 403);
    const result = await data.db.collection("courses").deleteOne({ _id: data.id, teacherId: new ObjectId(data.user.id), studentIds: { $size: 0 } });
    if (!result.deletedCount) return fail(request, "Only courses without enrolled students can be deleted.", 409);
    return json(request, { message: "Course deleted." });
  } catch (error) { return serverError(request, error); }
}
