# Impact Construction Showcase

A premium, database-driven construction and handy-work portfolio for showcasing completed projects and turning interest into work requests.

## Stack
- React, Vite, React Router, Framer Motion, Lucide React
- Express.js REST API
- Supabase PostgreSQL, Auth, and Storage

## Local setup
1. Run `database/schema.sql` in Supabase SQL Editor.
2. Copy `backend/.env.example` to `backend/.env` and add Supabase values.
3. Copy `frontend/.env.example` to `frontend/.env`.
4. Run `npm install` inside both `frontend` and `backend`.
5. Start the API with `npm run dev` inside `backend`.
6. Start Vite with `npm run dev` inside `frontend`.

## Production
Deploy `frontend` to Vercel/Netlify and `backend` to Render/Railway. Set the production `VITE_API_URL`, `FRONTEND_URL`, Supabase URL, and server-only Supabase secret key in each platform. Never expose the secret key to the browser.

## Supabase storage
Create public buckets named `company-assets`, `project-images`, and `project-videos`, plus a private `reference-files` bucket. The admin Settings page uploads the company logo to `company-assets`; the saved URL automatically drives the public logo and favicon. Project media stores paths and metadata in PostgreSQL; binary files belong in Storage.

## Routes
Visitor routes: `/`, `/projects`, `/projects/:projectId`, `/contact`.
Admin routes: `/admin/login`, `/admin/dashboard`, `/admin/projects`, `/admin/requests`, `/admin/reviews`.
