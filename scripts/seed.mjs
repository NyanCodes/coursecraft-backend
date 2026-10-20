import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Set MONGODB_URI in .env.local first.");
const dbName = process.env.MONGODB_DB || "online_course_service";
const users = [
  { username: "teacher1", email: "teacher1@example.com", role: "Teacher", password: "Teacher123!" },
  { username: "teacher2", email: "teacher2@example.com", role: "Teacher", password: "Teacher123!" },
  { username: "teacher3", email: "teacher3@example.com", role: "Teacher", password: "Teacher123!" },
  { username: "student1", email: "student1@example.com", role: "Student", password: "Student123!" },
  { username: "student2", email: "student2@example.com", role: "Student", password: "Student123!" },
  { username: "student3", email: "student3@example.com", role: "Student", password: "Student123!" },
];

const client = new MongoClient(uri);
try {
  await client.connect();
  const collection = client.db(dbName).collection("users");
  await collection.createIndex({ username: 1 }, { unique: true });
  await collection.createIndex({ email: 1 }, { unique: true });
  for (const user of users) {
    const { password, ...profile } = user;
    await collection.updateOne({ username: user.username }, { $set: { ...profile, password: await bcrypt.hash(password, 12) } }, { upsert: true });
  }
  console.log("Seeded 3 teacher and 3 student accounts.");
} finally {
  await client.close();
}
