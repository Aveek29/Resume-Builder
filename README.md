# ResumeForge AI

AI-powered resume builder with professional templates, smart suggestions, and PDF export.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env .env.local   # edit with your values

# 3. Build and start
npm run build
npm start            # production on port 5000
```

Development:
```bash
npm run dev          # backend + frontend hot-reload
```

## Features

- **34 ATS-friendly templates** — classic to modern designs
- **AI Assistant** — generate summaries, projects, achievements, skills via Groq
- **Smart Chat** — conversational AI to refine any resume section
- **Live Preview** — see changes as you type
- **PDF Export** — clean print layouts
- **Authentication** — JWT-based, password recovery

## Project Structure

```
├── backend/src/          # Express + TypeScript API
│   ├── config/           # env, db (MongoDB)
│   ├── controllers/      # auth, resume, ai
│   ├── middleware/       # JWT auth
│   ├── models/          # User, Resume, ChatHistory
│   ├── routes/          # auth, resume, ai
│   ├── services/        # Groq AI integration
│   └── app.ts           # server entry
├── frontend/src/         # React + Vite + Tailwind
│   ├── api/             # Axios client
│   ├── components/      # template renderers
│   ├── pages/           # 7 pages
│   ├── store/           # Zustand
│   └── types/           # TS definitions
├── .env                  # environment template
├── Procfile              # Elastic Beanstalk
└── ResumeBuilder-project.zip  # compiled dist (origin)
```

## Compiled Version

The `ResumeBuilder-project.zip` contains the original compiled build — fully working without TypeScript sources. Extract and run:

```bash
unzip ResumeBuilder-project.zip -d compiled
cd compiled/backend
node dist/app.js          # serves API + frontend on :5000
```

This zip was the starting point for reverse-engineering the TypeScript source. The `backend/dist/` and `frontend/dist/` directories in this repo are re-generated from source via `npm run build`.

## Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 3, Framer Motion, Zustand, React Router 6
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Groq SDK
- **Deploy:** AWS Elastic Beanstalk (see Procfile)

## Environment Variables

| Variable       | Description              |
|---------------|--------------------------|
| `PORT`        | Server port (default 5000) |
| `DATABASE_URL` | MongoDB connection string |
| `JWT_SECRET`  | JWT signing secret        |
| `GROQ_API_KEY`| Groq AI API key           |
