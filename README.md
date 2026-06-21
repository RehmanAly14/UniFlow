# UniFlow

## Project Overview

UniFlow is a university academic management platform with a React Native Expo frontend and an Express + Prisma backend. It supports student and teacher workflows for authentication, timetable access, resource sharing, result lookup, and AI-powered academic assistance.

## Architecture

- `backend/`: Node.js API server using Express.
- `frontend/`: Expo React Native app built with Expo Router.
- `backend/prisma/schema.prisma`: PostgreSQL data model definitions.
- `frontend/utils/supabase.ts`: Supabase client configuration for authentication and session management.

## Key Features

### Authentication
- Sign up and login through backend auth routes.
- Uses Supabase auth for user sessions.
- User roles: `STUDENT`, `TEACHER`, `ADMIN`.

### Student Features
- View timetable by degree, semester, and section.
- Access student-specific resources.
- Chat with AI assistant for study, timetable, and GPA guidance.
- Retrieve exam results using external LMS API.

### Teacher Features
- Upload resources to Cloudinary and make them available to students.
- View personal timetable.
- Upload Excel timetable files that are parsed and imported into the database.

### Admin Features
- Admin dashboard layout for system overview and management actions.

### AI Assistant
- Backend chat integration using Groq OpenAI-compatible API.
- Stores chat history in Prisma.
- Provides contextual responses based on user timetable and resources.

## Backend

### Stack
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- Supabase Auth
- Cloudinary
- Axios
- Multer
- XLSX

### Important Backend Files
- `backend/index.js`: App entrypoint and route registration.
- `backend/src/routes/*`: API route definitions.
- `backend/src/controllers/*`: Business logic for auth, timetables, resources, results, and AI.
- `backend/src/config/*`: Prisma, Supabase, and Cloudinary configuration.
- `backend/prisma/schema.prisma`: Database models.

### Backend API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/timetable/upload`
- `GET /api/timetable/student`
- `GET /api/timetable/teacher`
- `GET /api/timetable/all`
- `GET /api/timetable/teacher/today`
- `GET /api/results/student`
- `POST /api/resources/upload`
- `GET /api/resources/teacher`
- `GET /api/resources/student`
- `GET /api/resources/teacher/count`
- `POST /api/ai/chat`
- `GET /api/ai/chat-history`

## Frontend

### Stack
- Expo
- React Native
- Expo Router
- Supabase JS
- Zustand
- Expo Vector Icons
- React Navigation

### Notable Frontend Pages
- Authentication flow: `frontend/app/(auth)/login.tsx`, `frontend/app/(auth)/signup.tsx`
- Student dashboard and timetable: `frontend/app/(app)/student/timetable.tsx`
- AI assistant: `frontend/app/(app)/student/ai.tsx`
- Teacher upload: `frontend/app/(app)/teacher/upload.tsx`
- Admin dashboard: `frontend/app/(app)/admin/index.tsx`

## Setup

### Backend

1. Navigate to `backend/`
2. Install dependencies:
   - `npm install`
3. Create a `.env` file with the required variables:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `CLOUDINARY_NAME`
   - `CLOUDINARY_KEY`
   - `CLOUDINARY_SECRET`
   - `GROQ_API_KEY`
   - `UAF_API_KEY`
4. Start the server:
   - `npm run dev`

### Frontend

1. Navigate to `frontend/`
2. Install dependencies:
   - `npm install`
3. Ensure `frontend/utils/config.ts` points to the correct backend URL:
   - `BACKEND_URL = "http://<your-backend-host>:5000"`
4. Start Expo:
   - `npm start`

## Notes

- The frontend currently uses hardcoded Supabase credentials in `frontend/utils/supabase.ts`; replace these with environment-safe values before production.
- The timetable upload expects an Excel workbook with days, rooms, and time slots in the first rows.
- AI chat requires `GROQ_API_KEY` for the Groq OpenAI-compatible endpoint.
- Results lookup uses `UAF_API_KEY` for the external LMS API.

## Development Tips

- Use the backend `nodemon` dev script for live reloading.
- Update `frontend/utils/config.ts` if the backend address changes.
- Review Prisma schema before running migrations.

## Contact

This README was generated from the UniFlow project source structure. Update it with project-specific details as needed.

