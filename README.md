# Secure Online Examination Management System (SEMS)

SEMS is a full-stack web platform for conducting secure online exams with role-based workflows for Admin, Teacher, and Student users.

This repository contains:
- `Backend/` - Node.js + Express + MongoDB API
- `Frontend/` - React + Vite client application

## 1. What This Project Solves

SEMS supports a complete online examination lifecycle:
1. Admin manages users (students and teachers).
2. Teacher creates questions and exams.
3. Student sees eligible exams and attempts them.
4. System evaluates and stores results.
5. Student/Teacher/Admin can review outcomes based on role permissions.

It also includes exam proctoring checks (tab visibility, fullscreen control, webcam face detection).

## 2. Tech Stack

### Frontend
- React 19
- Vite 8
- React Router 6
- Axios
- Tailwind CSS 4
- TensorFlow.js + BlazeFace (`@tensorflow/tfjs`, `@tensorflow-models/blazeface`) for webcam proctoring

### Backend
- Node.js (ES modules)
- Express 4
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- Role-based authorization middleware

## 3. Repository Structure

```text
SEMS/
  Backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
    server.js
    package.json
  Frontend/
    src/
      components/
      layouts/
      pages/
      router/
      services/
    index.html
    package.json
```

## 4. Prerequisites

Install the following before running the app:
- Node.js 18+ (recommended LTS)
- npm 9+
- MongoDB Atlas or local MongoDB instance

## 5. Environment Configuration

### Backend `.env`
Create `Backend/.env` with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
JWT_EXPIRE=1d
```

### Frontend `.env`
Create `Frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000/api
```

## 6. Local Setup (First Time)

Open two terminals from repository root.

### Terminal A: Backend

```bash
cd Backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000` by default.

### Terminal B: Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on Vite dev server (usually `http://localhost:5173`).

## 7. Build for Production

### Frontend build

```bash
cd Frontend
npm run build
```

### Backend start (production style)

```bash
cd Backend
npm start
```

## 8. Default Roles and Functional Scope

### Admin
- Dashboard/System overview
- User management (create/update/delete students and teachers)
- Activity logs and reports

### Teacher
- Dashboard
- Question bank management
- Create exam
- Manage exams
- Reports and student performance visibility

### Student
- Dashboard
- Available exams
- Attempt exam
- Results

All key routes are protected by role via frontend route guards and backend middleware.

## 9. API Overview (High-Level)

Base URL: `/api`

### Auth
- `POST /auth/login`

### Users
- `POST /users` (admin)
- `GET /users` (admin/teacher)
- `PUT /users/:id` (admin)
- `DELETE /users/:id` (admin)

### Questions
- `POST /questions` (teacher)
- `GET /questions` (teacher/admin)
- `PUT /questions/:id` (teacher)
- `DELETE /questions/:id` (teacher)

### Exams
- `POST /exams` (teacher)
- `GET /exams/available` (student)
- `GET /exams` (teacher/student/admin)
- `GET /exams/:id` (teacher/student/admin)
- `PUT /exams/:id` (teacher)

### Results
- `POST /results/submit` (student)
- `GET /results/my-results` (student)
- `GET /results/exam/:examId` (teacher/admin)

### Activity
- `GET /activity` (admin/teacher)
- `POST /activity/log` (student)

## 10. Authentication and Authorization

### Frontend
- Stores `token`, `role`, `user` in localStorage after login.
- Uses route-level protection in `Frontend/src/router/AppRouter.jsx`.
- Redirects users to their own dashboard on role mismatch.

### Backend
- `protect` middleware validates JWT.
- `authorizeRoles(...)` middleware enforces role access per route.

## 11. Exam Proctoring Logic (Student)

Implemented in student exam flow:
- Fullscreen enforcement
- Tab switch tracking with warning/auto-submit rules
- Webcam-based face detection (BlazeFace)
- No-face and multiple-face timers with warning-first behavior
- Auto-submit after violation thresholds
- Activity log submission for proctoring events

## 12. Recommended Developer Workflow

1. Pull latest changes.
2. Run backend and frontend in separate terminals.
3. Validate role-specific flows after feature updates.
4. Run frontend build before pushing:

```bash
cd Frontend
npm run build
```

5. Keep services centralized in `Frontend/src/services/` for API calls.
6. Reuse shared components from `Frontend/src/components/common/` when possible.

## 13. Common Troubleshooting

### Backend fails to start
- Verify `Backend/.env` keys exist.
- Check MongoDB connection string.
- Ensure no port conflict on `5000`.

### Frontend cannot call API
- Confirm backend is running.
- Check `Frontend/.env` `VITE_API_URL`.
- Verify browser localStorage has a valid `token` after login.

### Unauthorized/redirect loops
- Clear localStorage and login again.
- Confirm user role from backend response matches expected route.

### Webcam/proctoring not working
- Confirm browser camera permission is granted.
- Use HTTPS in production environments for camera APIs.

## 14. Security Notes

- Do not commit real credentials or production secrets.
- Rotate `JWT_SECRET` and DB credentials if exposed.
- Keep CORS restricted in production to trusted frontend origins.

## 15. Contribution Notes

When contributing:
- Keep role boundaries clear (admin/teacher/student features).
- Avoid hardcoded demo values in dashboard/business logic.
- Add proper loading, empty, and error states for async pages.
- Preserve existing UI style unless explicitly redesigning.

## 16. Quick Start Checklist for New Developers

1. Clone repository.
2. Configure `Backend/.env` and `Frontend/.env`.
3. Install dependencies in both `Backend/` and `Frontend/`.
4. Start backend (`npm run dev`) and frontend (`npm run dev`).
5. Login and verify all three role flows.
6. Build frontend before submitting changes.

---

If you are onboarding as a new developer, start by reading:
1. `Frontend/src/router/AppRouter.jsx`
2. `Backend/server.js`
3. `Frontend/src/services/api.js`
4. `Backend/middleware/authMiddleware.js` and `Backend/middleware/roleMiddleware.js`
