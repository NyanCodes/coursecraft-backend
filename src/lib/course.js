import { ObjectId } from "mongodb";

export function courseInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const durationDays = Number(body.durationDays);
  const price = Number(body.price);
  const maxStudents = Number(body.maxStudents);
  const topics = Array.isArray(body.topics) ? body.topics.map((topic) => String(topic).trim()).filter(Boolean) : [];
  const status = body.status || "Open";
  if (!name || !Number.isInteger(durationDays) || durationDays < 1 || !Number.isFinite(price) || price < 0 || !Number.isInteger(maxStudents) || maxStudents < 1 || !topics.length || !["Open", "Close", "Cancel"].includes(status)) return null;
  return { name, durationDays, topics, price, maxStudents, status };
}

export function objectId(value) {
  return ObjectId.isValid(value) && String(new ObjectId(value)) === value ? new ObjectId(value) : null;
}

export function courseView(course, students = undefined) {
  return {
    id: String(course._id), name: course.name, durationDays: course.durationDays,
    topics: course.topics, price: course.price, maxStudents: course.maxStudents,
    status: course.status, teacherId: String(course.teacherId), teacherName: course.teacherName,
    enrolledCount: course.studentIds?.length || 0,
    ...(students ? { students } : {}),
  };
}
