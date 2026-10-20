import { ObjectId } from "mongodb";
import { getDatabase } from "../../../../../lib/mongodb";
import { requireRole } from "../../../../../lib/auth";
import { objectId } from "../../../../../lib/course";
import { fail, json, options, serverError } from "../../../../../lib/utils";

export const OPTIONS = options;

export async function POST(request, { params }) {
  const auth = requireRole(request, "Student");
  if (!auth.user) return fail(request, auth.message, auth.status);
  const id = objectId((await params).course_id);
  if (!id) return fail(request, "Invalid course ID.");
  try {
    const db = await getDatabase();
    const studentId = new ObjectId(auth.user.id);
    const student = await db.collection("users").findOne({ _id: studentId, role: "Student" });
    if (!student) return fail(request, "Student not found.", 401);
    const result = await db.collection("courses").updateOne(
      { _id: id, status: "Open", studentIds: { $ne: studentId }, $expr: { $lt: [{ $size: "$studentIds" }, "$maxStudents"] } },
      { $addToSet: { studentIds: studentId }, $set: { updatedAt: new Date() } },
    );
    if (result.modifiedCount) return json(request, { message: "Enrollment successful." }, 201);
    const course = await db.collection("courses").findOne({ _id: id });
    if (!course || course.status === "Cancel") return fail(request, "Course not found.", 404);
    if (course.studentIds?.some((value) => String(value) === auth.user.id)) return fail(request, "You are already enrolled.", 409);
    if (course.status !== "Open") return fail(request, "This course is closed for enrollment.", 409);
    return fail(request, "This course is full.", 409);
  } catch (error) { return serverError(request, error); }
}
