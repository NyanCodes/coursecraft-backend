# Coursecraft API

Next.js backend for the CSX4107 Online Course Service. MongoDB stores users, courses, and enrollments. The API enforces Teacher/Student roles, course ownership, status rules, seat limits, and duplicate enrollment prevention.

## Run locally

Use Node.js 20.19+ or 22.12+. Copy `.env.example` to `.env.local`, then set `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`, and `FRONTEND_URL`. Keep the database connection string and JWT secret private.

```bash
npm ci
npm run seed
npm run dev
```

The API runs at `http://localhost:3000`. The seed command safely creates or updates three Teachers and three Students.

## Test users

| Role | Username | Email | Password |
| --- | --- | --- | --- |
| Teacher | teacher1 | teacher1@example.com | Teacher123! |
| Teacher | teacher2 | teacher2@example.com | Teacher123! |
| Teacher | teacher3 | teacher3@example.com | Teacher123! |
| Student | student1 | student1@example.com | Student123! |
| Student | student2 | student2@example.com | Student123! |
| Student | student3 | student3@example.com | Student123! |

These are demonstration accounts. Change or remove them for any other use.

## API

Sign in with `POST /api/auth/login` using `{ "identifier": "teacher1", "password": "Teacher123!" }`. Send the returned token as `Authorization: Bearer <token>` to protected routes.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/user` | Current user |
| GET | `/api/course` | Teacher's own courses or Student-visible courses; Students can use `search` or `enrolled=true` |
| POST | `/api/course` | Teacher creates a course |
| GET | `/api/course/:id` | Course details and Teacher-owned roster |
| PUT | `/api/course/:id` | Owner Teacher updates a course |
| DELETE | `/api/course/:id` | Owner Teacher deletes a course with no enrollments |
| POST | `/api/course/:id/enroll` | Student enrolls in an Open course with a free seat |

## Deploy on Vercel

Use the Next.js framework preset with this repository as the project root. Set `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`, and `FRONTEND_URL` in Vercel project settings. `FRONTEND_URL` accepts the frontend origin without a trailing slash (or comma-separated allowed origins). Run `npm run seed` locally against the deployed Atlas database before testing.

Frontend source: https://github.com/NyanCodes/coursecraft-frontend

Live API: https://coursecraft-backend-two.vercel.app

Live frontend: https://coursecraft-frontend-beta.vercel.app

Changes pushed to `main` trigger a new Vercel deployment automatically.
