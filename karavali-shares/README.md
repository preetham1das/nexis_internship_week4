# Karavali Shares

A beginner-friendly full-stack social media app for sharing coastal Karnataka culture, food, Kambala, Daiva Kola, Yakshagana, festivals, photos and videos.

## Stack
- Frontend: React + Vite + JavaScript, React Router, Axios
- Backend: Node.js, Express, MongoDB Atlas, Mongoose
- Authentication: JWT + bcryptjs
- Media: image/video uploads stored locally by the backend, or public URLs

## Requirements
- Node.js 18+
- MongoDB Atlas account or local MongoDB

## 1. Configure the backend
Open a terminal in `backend` and run:
```bash
npm install
```
Copy `.env.example` to `.env` and fill in your values:
```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/karavali_shares?retryWrites=true&w=majority
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```
Keep `.env` private. Never upload it to GitHub.

Start the backend:
```bash
npm run dev
```
You should see `MongoDB connected` and `Karavali Shares API running on port 5000`.

## 2. Configure the frontend
Open a second terminal in `frontend` and run:
```bash
npm install
```
Copy `.env.example` to `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend:
```bash
npm run dev
```
Open the local URL shown by Vite, usually `http://localhost:5173`.

## How to use
1. Visit the public landing page, then register an account or log in.
2. After logging in, view the community feed and create a post with a caption, category, and optional image/video selected from your device or a publicly accessible URL. Device uploads allow JPG, PNG, WebP, GIF, MP4, WebM, and MOV; images are limited to 10 MB and videos to 100 MB.
3. Like posts, comment, filter by category, and delete your own posts. Only logged-in users can view posts.

## API endpoints
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — log in and receive JWT
- `GET /api/posts` — list posts (JWT required; optional `?category=Kambala`)
- `POST /api/posts` — create a post (JWT required; JSON or multipart form with optional `media` file)
- `PUT /api/posts/:id/like` — like/unlike (JWT required)
- `POST /api/posts/:id/comments` — add a comment (JWT required)
- `DELETE /api/posts/:id` — delete your own post (JWT required)
- `GET /api/health` — health check

## Production deployment configuration

On Render, configure these backend environment variables:
- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — a long, random secret
- `CLIENT_URL` — the exact deployed Vercel origin, for example `https://your-project.vercel.app` (no `/` or route after the hostname)

On Vercel, configure this frontend environment variable for Production:
```env
VITE_API_URL=https://karavali-shares-api.onrender.com/api
```

`VITE_API_URL` is embedded at build time, so redeploy the Vercel project after changing it. The frontend falls back to localhost only during local Vite development; production builds use the deployed API URL if the variable is missing.
Render's `CLIENT_URL` allows only the configured origin, so Vercel preview deployments need their origin explicitly allowed by the backend CORS configuration.

`GET /api` returning `Route not found` is expected: the API does not define a root `/api` route. Use `GET /api/health` to check backend availability. Authentication endpoints are `POST /api/auth/register` and `POST /api/auth/login`.

## Important
- Uploaded media is stored in `backend/uploads`; keep this directory persistent and include it in backups. Local disk storage may not persist on some hosting providers, so configure persistent storage or cloud media storage before deploying there.
- Do not share copyrighted videos without permission. Respect privacy and sacred/cultural contexts when posting ritual footage.
- Before public deployment, add stronger moderation, rate limiting, pagination, and cloud media uploads.
- For deployment, host the frontend on Vercel/Netlify, backend on Render, and use MongoDB Atlas. Set `CLIENT_URL` to your deployed frontend URL and `VITE_API_URL` to your deployed backend API URL.
