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

## PDF Export Guide

For the best-looking, ATS-friendly resume PDF, use the following print settings:

| Setting | Recommended Value |
|---|---|
| Destination | Save as PDF / Microsoft Print to PDF |
| Paper Size | A4 |
| Layout | Portrait |
| Pages | All |
| Color | Color |
| Margins | Minimum |
| Scale | 90–100% |
| Pages per Sheet | 1 |
| Headers & Footers | Disabled |
| Background Graphics | Enabled |

**Best Results**
- Fits the resume on a single page
- Preserves sidebar colors and styling
- Maintains professional spacing
- ATS-friendly PDF output

**Troubleshooting**

| Issue | Fix |
|---|---|
| Resume appears too small | Increase Scale to 100%, ensure Paper Size is A4 |
| Content overflows to a second page | Reduce Scale to 90–95%, check Margins are set to Minimum |
| Sidebar colors are missing | Enable "Background Graphics" in the print dialog |

**Recommended Configuration**
```
Paper Size      : A4
Layout          : Portrait
Margins         : Minimum
Scale           : 90%
Pages per Sheet : 1
Color           : Color
```

This configuration typically produces the clean one-page layout shown in the preview and maximizes usable page space while maintaining readability.

## Environment Variables

| Variable       | Description              |
|---------------|--------------------------|
| `PORT`        | Server port (default 5000) |
| `DATABASE_URL` | MongoDB connection string |
| `JWT_SECRET`  | JWT signing secret        |
| `GROQ_API_KEY`| Groq AI API key           |
