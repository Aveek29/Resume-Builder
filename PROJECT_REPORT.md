# ResumeForge AI — Project Report

## 1. Project Overview

ResumeForge AI is a full-stack web application that enables users to build professional, ATS-friendly resumes using AI-powered suggestions, 34 customizable templates, and instant PDF export. The application was reverse-engineered from a compiled/bundled production build (`ResumeBuilder-project.zip`) back into well-structured TypeScript source code.

### 1.1 Origin

The project began as a compiled production build stored in `ResumeBuilder-project.zip` (228 KB). This zip contained:

- `backend/dist/` — compiled JavaScript output (Express API)
- `frontend/dist/` — Vite-bundled static assets (minified React SPA)
- `Procfile` — Elastic Beanstalk process definition
- `.env.example` — environment variable template

There were **no TypeScript source files**, no `src/` directories, no configuration files (tsconfig, vite.config, tailwind.config, etc.). Every source file in this repository was reconstructed by analyzing the compiled output, inferring patterns, and recreating idiomatic TypeScript/React code that produces equivalent functionality.

### 1.2 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS 3, Framer Motion, Zustand 5, React Router 7, Axios |
| **Backend** | Node.js, Express 4, TypeScript, Mongoose 8, JWT, Groq SDK |
| **Database** | MongoDB (via Mongoose ODM) |
| **AI** | Groq Cloud (Llama 3.3 70B) |
| **Deployment** | AWS Elastic Beanstalk |
| **Build Tools** | TypeScript 5/6, Vite 8 (rolldown), PostCSS, Autoprefixer, concurrently |

---

## 2. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  React SPA (Vite dev :5173 / production :5000)              │
└───────────────┬──────────────────────────────────┬───────────┘
                │ HTTP (JSON API)                  │ Static Files
                ▼                                  ▼
┌──────────────────────────────────────────────────────────────┐
│                    Express Server (app.ts)                    │
│                                                              │
│  helmet() → cors() → rateLimit(100/15m) → json() → 30s      │
│                                                              │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐                 │
│  │ /api/auth│  │/api/resumes│  │ /api/ai  │                 │
│  └────┬─────┘  └─────┬──────┘  └────┬─────┘                 │
│       │               │              │                        │
│       ▼               ▼              ▼                        │
│  authController  resumeController  aiController              │
│       │               │              │                        │
│       ▼               ▼              ▼                        │
│  User Model      Resume Model    ChatHistory Model           │
│       │               │              │                        │
│       └───────────────┴──────────────┘                        │
│                       │                                       │
│                       ▼                                       │
│                   MongoDB                                     │
│                                                              │
│  ┌──────────────────────────────────┐                        │
│  │ groqService (llama-3.3-70b)      │                        │
│  │ 6 system prompts, lazy client    │                        │
│  └──────────────────────────────────┘                        │
└──────────────────────────────────────────────────────────────┘
```

### 2.1 Frontend-Backend Communication

- **Development:** Vite dev server on port 5173 proxies `/api/*` requests to `http://localhost:5000`
- **Production:** Express serves both the API (`/api/*`) and the built frontend static files (from `frontend/dist/`) on the same port (5000)
- All non-API routes (`GET *`) return `index.html` for SPA client-side routing

---

## 3. Backend Architecture

### 3.1 Directory Structure

```
backend/src/
├── app.ts                        # Express server entry + middleware stack
├── config/
│   ├── env.ts                    # Environment variable loader (dotenv)
│   └── db.ts                     # MongoDB connection with retry logic
├── controllers/
│   ├── authController.ts         # Register, login, forgot-password, get-me
│   ├── resumeController.ts       # CRUD + duplicate + generate sample
│   └── aiController.ts           # AI feature handlers + chat persistence
├── middleware/
│   └── auth.ts                   # JWT Bearer token authentication
├── models/
│   ├── User.ts                   # User schema (bcrypt hashing)
│   ├── Resume.ts                 # Resume schema (9 sections)
│   └── ChatHistory.ts            # AI chat history schema
├── routes/
│   ├── authRoutes.ts             # Auth endpoints + validation
│   ├── resumeRoutes.ts           # Protected resume endpoints
│   └── aiRoutes.ts               # Rate-limited AI endpoints
├── services/
│   └── groqService.ts            # Groq AI integration (6 task prompts)
└── utils/
    ├── asyncHandler.ts           # Async error wrapper
    └── jwt.ts                    # JWT sign/verify utilities
```

### 3.2 Middleware Stack

| Middleware | Purpose | Config |
|---|---|---|
| `helmet()` | Security headers (CSP disabled) | Content-Security-Policy off for inline styles |
| `cors()` | Cross-origin requests | Dev: localhost:5173/3000, Prod: `true` |
| `rateLimit()` | Global rate limiting | 100 requests per 15 minutes |
| `express.json()` | Body parsing | 10 MB limit |
| `30s timeout` | Request timeout | Closes hanging connections |
| Error handler | Global catch-all | Returns `{ error: message }` with 500 |

### 3.3 API Endpoints

#### Authentication (`/api/auth`)

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/register` | No | `{ name, email, password }` | `{ token, user }` — 201 |
| POST | `/login` | No | `{ email, password }` | `{ token, user }` |
| POST | `/forgot-password` | No | `{ email }` | `{ message }` [1] |
| GET | `/me` | Yes | — | `{ id, name, email, createdAt }` |

[1] Always returns "If an account with that email exists, a reset link has been sent." — no user enumeration.

#### Resumes (`/api/resumes`)

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/` | Yes | — | `{ resumes }` — sorted by updatedAt desc |
| GET | `/:id` | Yes | — | `{ resume }` |
| POST | `/` | Yes | Resume data | `{ resume }` — 201 |
| POST | `/generate` | Yes | — | `{ resume }` — sample resume, 201 |
| PUT | `/:id` | Yes | Partial resume | `{ resume }` |
| DELETE | `/:id` | Yes | — | `{ message }` |
| POST | `/:id/duplicate` | Yes | — | `{ resume }` — 201 |

#### AI (`/api/ai`)

All AI endpoints require auth + rate limit (30 requests per 60 seconds).

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/summary` | `{ context }` | `{ summary }` |
| POST | `/project` | `{ description }` | `{ enhanced }` |
| POST | `/achievement` | `{ input }` | `{ achievement }` |
| POST | `/skills` | `{ role }` | `{ skills }` — JSON array |
| POST | `/enhance` | `{ text, type }` | `{ enhanced }` |
| POST | `/chat` | `{ message, lang? }` | `{ response, messages }` |
| GET | `/chat/history` | — | `{ messages }` |

#### Health

| Method | Path | Response |
|---|---|---|
| GET | `/api/health` | `{ status, db, timestamp }` |

### 3.4 Database Models

#### User
```typescript
{
  name: string;          // trimmed, max 100
  email: string;         // unique, lowercase, regex validated
  password: string;      // min 6, select: false, bcrypt hashed (12 rounds)
  createdAt: Date;
  updatedAt: Date;
}
```

#### Resume
```typescript
{
  userId: ObjectId;       // ref User, indexed
  title: string;          // default "Untitled Resume"
  template: string;       // default "tmpl_01"
  personalInfo: {         // fullName, email, phone, address, linkedin, github, portfolio }
  summary: string;
  education: [{           // degree, institution, location, startYear, endYear, cgpa }]
  experience: [{          // company, position, location, startDate, endDate, current, description }]
  projects: [{            // name, description, technologies, github, live }]
  skills: [{              // category, skills[] }]
  certifications: [{      // name, issuer, date }]
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### ChatHistory
```typescript
{
  userId: ObjectId;       // ref User, indexed
  messages: [{            // role: 'user' | 'assistant', content, timestamp }]
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.5 Graceful Degradation

The server is designed to operate even without a database connection:

| Scenario | Behavior |
|---|---|
| MongoDB unavailable on startup | Retries 3 times (3s delay), then starts server with warning |
| Auth operations with no DB | Returns 500 (requries DB) |
| Chat with no DB | Falls back to in-memory single-turn (no history persistence) |
| Chat history with no DB | Returns empty array |
| AI generation with no Groq key | Returns error message |

---

## 4. Frontend Architecture

### 4.1 Directory Structure

```
frontend/src/
├── main.tsx                        # React entry (StrictMode → App)
├── App.tsx                         # Router + ProtectedRoute wrapper
├── index.css                       # Tailwind + custom styles + print CSS
├── vite-env.d.ts                   # Vite type reference
├── api/
│   ├── client.ts                   # Axios instance + interceptors
│   ├── auth.ts                     # Login, register, forgot-password, get-me
│   ├── resumes.ts                  # CRUD + duplicate + generate-sample
│   └── ai.ts                       # 7 AI endpoint wrappers
├── components/
│   └── templates/
│       ├── ExecutiveTemplate.tsx    # Single resume renderer (all 34 templates)
│       ├── SectionHeader.tsx        # Section header with 4 visual styles
│       ├── templateStyles.ts        # Color derivation + style config engine
│       └── types.ts                 # TemplateStyleConfig interface
├── pages/
│   ├── LandingPage.tsx              # Marketing page (hero, features, previews)
│   ├── LoginPage.tsx                # Login form (validation, toggle password)
│   ├── RegisterPage.tsx             # Registration (password strength meter)
│   ├── ForgotPasswordPage.tsx       # Email form + success state
│   ├── DashboardPage.tsx            # Resume grid (CRUD actions, stats)
│   ├── TemplatesPage.tsx            # 34-template gallery with search
│   └── ResumeBuilderPage.tsx        # 8-step editor + live preview + AI chat
├── store/
│   ├── authStore.ts                 # Zustand auth state (localStorage persistence)
│   └── resumeStore.ts               # Zustand resume CRUD state
└── types/
    └── index.ts                     # All interfaces + template definitions
```

### 4.2 Routing

| Route | Component | Access |
|---|---|---|
| `/` | LandingPage | Public |
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/forgot-password` | ForgotPasswordPage | Public |
| `/templates` | TemplatesPage | Public |
| `/dashboard` | DashboardPage | Protected (redirect to /login) |
| `/builder/:id` | ResumeBuilderPage | Protected |
| `*` | Redirect to `/` | — |

### 4.3 State Management (Zustand)

#### Auth Store (`authStore.ts`)
```typescript
interface AuthState {
  isAuthenticated: boolean;   // derived from localStorage
  user: { id: string; name: string; email: string } | null;
  isLoading: boolean;
  error: string | null;
  login(email, password): Promise<void>;
  register(name, email, password): Promise<void>;
  logout(): void;
  loadUser(): Promise<void>;  // re-validate token on mount
  checkAuth(): boolean;
}
```
- Keys: `rf_token` (JWT), `rf_user` (JSON user object)
- Persisted to localStorage on every auth action

#### Resume Store (`resumeStore.ts`)
```typescript
interface ResumeState {
  resumes: Resume[];
  currentResume: Resume | null;
  currentStep: number;        // 0-7 for builder wizard
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchResumes(): Promise<void>;
  fetchResume(id): Promise<void>;
  createResume(data): Promise<Resume>;
  updateResume(id, data): Promise<void>;
  deleteResume(id): Promise<void>;
  duplicateResume(id): Promise<void>;
  setCurrentResume(resume): void;
  updateCurrentResume(data): void;
  setCurrentStep(step): void;
  clearError(): void;
}
```

### 4.4 API Client (`client.ts`)

```typescript
// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rf_token');
      localStorage.removeItem('rf_user');
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(err);
  }
);
```

### 4.5 Page Components

#### LandingPage
- Fixed navigation bar (Login, Sign Up, scroll links)
- Hero section: gradient headline, subtitle, CTA buttons
- Features grid: 8 cards (AI-Powered, Multiple Templates, Smart Suggestions, Easy Export, Mobile Friendly, ATS Optimized, Multi-Language, Instant Preview)
- Template previews: first 6 templates rendered as scaled-down ExecutiveTemplate thumbnails (scale 0.25)
- Footer: branding, links, social icons

#### LoginPage
- Email + password form with client-side validation
- Show/hide password toggle
- "Remember me" checkbox
- Links to Register and Forgot Password
- Toast notification on success

#### RegisterPage
- Name + email + password + confirm password form
- Real-time password strength meter (5 levels: Weak/Fair/Good/Strong based on length, uppercase, digit, special characters)
- Show/hide toggles for both password fields
- Client-side validation (name required, email regex, password min 6, confirm match)

#### ForgotPasswordPage
- Two-state UI: email input form → success confirmation
- Always returns success (security — no user enumeration)
- Animated checkmark on success

#### DashboardPage
- Welcome header with "Generate Sample" and "New Resume" buttons
- 3 stat cards: Total Resumes, Last Updated (relative time), AI Features (Unlimited)
- Resume grid: title, template name, relative timestamp, action buttons (Open, Duplicate, Delete)
- Empty state with call-to-action when no resumes exist
- `generateSample` uses dynamic import for code splitting
- Confirmation dialog before delete

#### TemplatesPage
- Back navigation + title with template count
- Search input filtering by template name (case-insensitive)
- Grid of all 34 templates (4 columns on xl screens)
- Each template: scaled ExecutiveTemplate (0.25) in aspect-[3/4] container
- Hover overlay with "Use Template" button
- Color dot indicator next to template name
- `handleSelect` navigates to `/builder/new?template=<id>`

#### ResumeBuilderPage (largest component — 421 lines)
- Left sidebar: 8-step wizard (Personal Info, Summary, Education, Experience, Projects, Skills, Certifications, Achievements)
- Each step has a form with relevant fields, add/remove array items
- Right panel: Live preview via ExecutiveTemplate with mobile/desktop toggle
- AI Enhancement buttons in each text section:
  - Summary → `aiApi.generateSummary`
  - Experience → `aiApi.enhanceProject` (per description)
  - Projects → `aiApi.enhanceProject` (per description)
  - Skills → `aiApi.suggestSkills` (per category)
  - Achievements → `aiApi.generateAchievement` (per item)
- Sliding AI Chat panel (360px): conversational AI for resume help
  - Message bubbles (user = blue right, assistant = gray left)
  - Loading animation (3 bouncing dots)
  - Enter key or send button
  - Chat persists to MongoDB when connected
- Save button (updates MongoDB) + Export PDF (`window.print()`)
- Mobile-responsive: hamburger toggle for sidebar

---

## 5. Template System

### 5.1 Architecture

The template system is the most architecturally interesting part of the project. **All 34 templates use a single React component** (`ExecutiveTemplate.tsx`). Visual variation is achieved entirely through a style configuration derived from the template ID.

```
Template ID (e.g., "tmpl_01")
    │
    ▼
getStyleConfig(templateId)
    │
    ├── Looks up base color from templateStyles map
    ├── Computes secondaryColor (lighten by 50%)
    ├── Computes accentColor (heuristic RGB analysis)
    ├── Selects sectionStyle (bordered/card/minimal/default)
    ├── Selects headerStyle (centered/gradient/default)
    └── Selects fontFamily (serif/Inter/Segoe UI)
    │
    ▼
TemplateStyleConfig
    │
    ▼
ExecutiveTemplate(resume, style)
    ├── Header (name, contact, title — styling varies by headerStyle)
    ├── SectionHeader (title — styling varies by sectionStyle)
    │   ├── Summary
    │   ├── Education
    │   ├── Experience
    │   ├── Projects
    │   ├── Skills
    │   ├── Certifications
    │   └── Achievements
    └── All inline styles — no CSS classes
```

### 5.2 The 34 Templates

| ID | Name | Color | Section Style | Header Style | Font |
|---|---|---|---|---|---|
| tmpl_01 | Executive | #1B2A4A | card | centered | Default |
| tmpl_02 | Legacy Serif | #2C1810 | default | default | Serif |
| tmpl_03 | Modern Edge | #0F172A | bordered | centered | Default |
| tmpl_04 | Clean Slate | #1E293B | default | default | Inter |
| tmpl_05 | Bold Impact | #111827 | bordered | default | Default |
| tmpl_06 | Gradient Flow | #312E81 | default | gradient | Default |
| tmpl_07 | Minimalist | #1F2937 | minimal | default | Default |
| tmpl_08 | Classic Touch | #3E2723 | default | default | Serif |
| tmpl_09 | Sleek Design | #0D47A1 | default | default | Default |
| tmpl_10 | Corporate | #1A237E | card | default | Default |
| tmpl_11 | Refined | #4A148C | minimal | default | Serif |
| tmpl_12 | Professional | #1B1B2F | default | default | Inter |
| tmpl_13 | Dynamic | #0F0C29 | default | gradient | Inter |
| tmpl_14 | Elite | #1A1A2E | bordered | default | Default |
| tmpl_15 | Vision | #0A192F | default | default | Default |
| tmpl_16 | Prestige | #1B2A4A | default | default | Default |
| tmpl_17 | Summit | #2D1B69 | default | default | Default |
| tmpl_18 | Apex | #0B1D3A | default | default | Default |
| tmpl_19 | Prime | #162447 | default | default | Default |
| tmpl_20 | Atlas | #1F4068 | default | default | Inter |
| tmpl_21 | Fusion | #2B2B2B | default | default | Default |
| tmpl_22 | Horizon | #1B1B1B | default | default | Default |
| tmpl_23 | Pinnacle | #1A237E | default | default | Default |
| tmpl_24 | Forte | #1B1B3A | default | default | Default |
| tmpl_25 | Vanguard | #0B0B1A | default | default | Default |
| tmpl_26 | Quest | #1A1A2E | default | default | Default |
| tmpl_27 | Zenith | #0D1B2A | default | default | Default |
| tmpl_28 | Aspect | #1B2838 | default | default | Default |
| tmpl_29 | Nexus | #0F111A | default | default | Default |
| tmpl_30 | Ethos | #1B2430 | default | default | Default |
| tmpl_31 | Axiom | #16213E | default | default | Default |
| tmpl_32 | Verve | #0F3460 | default | default | Default |
| tmpl_33 | Aurora | #1A1A2E | default | default | Inter |
| tmpl_34 | Prestige | #1B1B2F | default | default | Default |

### 5.3 Style Derivation Engine

```typescript
function getStyleConfig(templateId: string): TemplateStyleConfig
```

**Color Derivation:**
1. Look up base color from `templateStyles[templateId].color`
2. `secondaryColor` = `lightenColor(primaryColor, 50)` — lightens by blending with white
3. `accentColor` = `getAccentColor(primaryColor)` — heuristic analysis:
   - Red-dominant → gold (#D4A017)
   - Green-dominant → gold (#C9A84C)
   - Blue-dominant → gold (#C9A84C)
   - Very dark (< 50 RGB) → gold (#C9A84C)
   - Warm blue → gold (#D4AF37)
   - Default → gold (#D4A017)

**Section Style Map:**
```typescript
const sectionStyleMap: Record<string, string> = {
  tmpl_01: 'card', tmpl_10: 'card',
  tmpl_03: 'bordered', tmpl_05: 'bordered', tmpl_14: 'bordered',
  tmpl_07: 'minimal', tmpl_11: 'minimal',
};
```

**Header Style Map:**
```typescript
const headerStyleMap: Record<string, string> = {
  tmpl_01: 'centered', tmpl_03: 'centered',
  tmpl_06: 'gradient', tmpl_13: 'gradient',
};
```

### 5.4 SectionHeader Component

4 visual variants for section titles:

| Style | Rendering |
|---|---|
| `default` | Primary color text, 2px primary bottom border |
| `bordered` | Inline-block with 2px primary border, uppercase, letter-spaced |
| `card` | Primary background, white text, rounded corners |
| `minimal` | Uppercase, wide letter-spacing, accent-colored underline |

### 5.5 Thumbnail Generation

Templates are previewed by rendering the full ExecutiveTemplate at `scale-[0.25]` with `origin-top-left` inside an `aspect-[3/4]` container. This avoids the need for separate thumbnail generation, SSR, or screenshot APIs — the browser layout engine produces accurate mini-previews in real time.

```tsx
<div className="aspect-[3/4] overflow-hidden rounded-lg border">
  <div className="w-[400%] h-[400%] origin-top-left scale-[0.25]">
    <ExecutiveTemplate resume={sampleResume} style={getStyleConfig(tmpl.id)} />
  </div>
</div>
```

---

## 6. AI Integration

### 6.1 Service Architecture

```typescript
// groqService.ts — Lazy singleton pattern
let groqClient: Groq | null = null;

const getGroq = () => {
  if (!groqClient) groqClient = new Groq({ apiKey: config.groqApiKey });
  return groqClient;
};
```

**Model:** `llama-3.3-70b-versatile` (Groq-hosted Llama 3.3 70B)

**Internal helper:**
```typescript
const complete = async (
  system: string, user: string,
  maxTokens = 300, temperature = 0.7
): Promise<string>
```

### 6.2 Task-Specific Prompts

| Function | System Prompt | Max Tokens | Temperature |
|---|---|---|---|
| `generateSummary` | "Professional resume writer. Generate 3-4 sentences. No markdown." | 300 | 0.7 |
| `enhanceProject` | "Professional resume writer. 2-3 sentences highlighting impact." | 200 | 0.7 |
| `generateAchievement` | "Convert to professional bullet. Action verbs. Quantify." | 150 | 0.7 |
| `suggestSkills` | "Career advisor. Return ONLY JSON array of 10-15 strings." | 300 | 0.5 |
| `enhanceText` | "Resume content enhancer. Preserve JSON structure if detected." | 600 | 0.6 |
| `chat` | "Multilingual career advisor. 12 languages. Respond in user's language." | 500 | 0.7 |

### 6.3 Chat System

The chat system supports both persistent and non-persistent modes:

```
User sends { message, lang? }
    │
    ▼
Check MongoDB connection state
    │
    ├── Connected:
    │     ├── Find or create ChatHistory for userId
    │     ├── Append user message
    │     ├── Slice last 10 messages → groqService.chat()
    │     ├── Append assistant response
    │     ├── Save to MongoDB
    │     └── Return last 20 messages
    │
    └── Disconnected:
          ├── Create in-memory message array
          ├── Send to groqService.chat()
          └── Return single-turn response
```

**Multilingual Support:**
- 12 supported languages (English, Spanish, French, German, Chinese, Japanese, Korean, Hindi, Arabic, Portuguese, Russian, Italian)
- Language instruction appended to each user message
- AI detects and matches the user's language
- System prompt specifies topics: resume writing, career advice, interview prep, job search, professional development

### 6.4 Error Handling

- All controller functions wrapped in `asyncHandler` (try/catch forwarding)
- `suggestSkills` has a robust fallback parser if JSON.parse fails
- Chat returns a hardcoded apology string on failure
- Rate limited to 30 requests per 60 seconds per user

---

## 7. Authentication System

### 7.1 Registration Flow
```
POST /api/auth/register
    │
    ├── express-validator (name, email, password min 6)
    ├── Check for existing email → 400 if duplicate
    ├── Create User (password auto-hashed via pre-save hook, bcrypt 12 rounds)
    ├── Generate JWT { userId } with 7-day expiry
    └── Respond { token, user: { id, name, email } } — 201
```

### 7.2 Login Flow
```
POST /api/auth/login
    │
    ├── express-validator (email, password)
    ├── Find user by email with .select('+password')
    ├── bcrypt.compare(password, user.password)
    ├── Generate JWT { userId } with 7-day expiry
    └── Respond { token, user: { id, name, email } }
```

### 7.3 JWT Details
| Property | Value |
|---|---|
| Algorithm | HS256 (jsonwebtoken default) |
| Payload | `{ userId: string }` |
| Expiry | 7 days |
| Secret | `JWT_SECRET` environment variable |

### 7.4 Auth Middleware
```
Request → Authorization: Bearer <token>
    │
    ├── No token → 401 { error: 'Access denied. No token provided.' }
    ├── Invalid/expired → 401 { error: 'Invalid or expired token.' }
    └── Valid → req.userId = decoded.userId → next()
```

### 7.5 Frontend Auth Flow
```
App Mount
    │
    ├── Read localStorage('rf_token')
    │     ├── Exists → loadUser() → GET /api/auth/me
    │     │     ├── 200 → set user, isAuthenticated = true
    │     │     └── 401 → clear storage, isAuthenticated = false
    │     └── Missing → isAuthenticated = false
    │
    ├── Login/Register → POST /api/auth/login or /register
    │     ├── Success → store token + user in localStorage
    │     └── Error → display toast message
    │
    ├── ProtectedRoute → checks isAuthenticated
    │     ├── false → Navigate to /login
    │     └── true → render children
    │
    └── Logout → clear localStorage → isAuthenticated = false
```

---

## 8. Deployment

### 8.1 AWS Elastic Beanstalk

The project is configured for single-instance deployment via AWS Elastic Beanstalk:

```
Procfile:
web: node backend/dist/app.js
```

The server runs on port 5000 (configured via `PORT` env var or default). It serves both the REST API and the built frontend static files from a single Express process.

### 8.2 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | `development` or `production` |
| `DATABASE_URL` | Yes* | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `GROQ_API_KEY` | Yes* | Groq AI API key |

\* Application runs without these but relevant features are disabled.

### 8.3 Build Process

```bash
npm install          # Root installs deps for both sub-projects
npm run build        # Frontend (Vite) → Backend (tsc)
npm start            # Production: node backend/dist/app.js
```

The build produces:
- `frontend/dist/` — optimized static assets (JS ~500KB, CSS ~23KB)
- `backend/dist/` — compiled JavaScript from TypeScript

---

## 9. Dependencies

### Backend

| Package | Version | Purpose |
|---|---|---|
| bcryptjs | ^2.4.3 | Password hashing |
| cors | ^2.8.5 | CORS middleware |
| dotenv | ^16.4.5 | Environment variable loading |
| express | ^4.21.0 | Web framework |
| express-rate-limit | ^7.4.0 | API rate limiting |
| express-validator | ^7.2.0 | Request validation |
| groq-sdk | ^0.7.0 | Groq AI API client |
| helmet | ^7.1.0 | Security headers |
| jsonwebtoken | ^9.0.2 | JWT signing/verification |
| mongoose | ^8.7.0 | MongoDB ODM |

### Frontend

| Package | Version | Purpose |
|---|---|---|
| axios | ^1.17.0 | HTTP client |
| framer-motion | ^12.40.0 | Page/component animations |
| react | ^19.2.6 | UI library |
| react-dom | ^19.2.6 | DOM rendering |
| react-hot-toast | ^2.6.0 | Toast notifications |
| react-icons | ^5.6.0 | Icon library |
| react-router-dom | ^7.16.0 | Client-side routing |
| zustand | ^5.0.14 | State management |

**Unused dependencies:** `@react-pdf/renderer`, `react-hook-form` — present in package.json but not imported in any source file.

---

## 10. Compiled Version Origin

The entire project was reconstructed from a compiled production build (`ResumeBuilder-project.zip`, 228 KB).

### What the zip contained:
```
ResumeBuilder-project.zip/
├── backend/
│   └── dist/              # Compiled JavaScript (TypeScript output)
│       ├── app.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
├── frontend/
│   └── dist/              # Vite-bundled assets (minified)
│       ├── index.html
│       ├── assets/
│       │   └── index-*.js       # ~500KB bundled JS
│       └── favicon.svg
├── .env.example
└── Procfile
```

### What was missing:
- ❌ No TypeScript source files (`src/` directories)
- ❌ No tsconfig.json
- ❌ No vite.config.ts, tailwind.config.js, postcss.config.js
- ❌ No package.json files with proper scripts
- ❌ No `.gitignore`

### Reconstruction approach:
1. Analyze compiled backend JS to understand API routes, models, controllers, and middleware
2. Analyze minified frontend JS to extract routes, components, and store patterns
3. Identify template system from rendered HTML patterns in the bundle
4. Recreate idiomatic TypeScript source matching the functionality
5. Recreate Vite/Tailwind/TypeScript config files
6. Verify by building and matching output behavior

---

## 11. Noteworthy Patterns

### 11.1 Single Component Template Architecture
34 visual templates rendered by one React component — style config produces all variation.

### 11.2 Scaled Thumbnail Previews
Live ExecutiveTemplate instances at `scale-[0.25]` produce accurate previews without server-side rendering or screenshots.

### 11.3 Graceful Database Degradation
Server starts and runs (with limited functionality) even without MongoDB.

### 11.4 Color Derivation Heuristics
`getAccentColor()` examines RGB channels to auto-select complementary gold accents from any primary color.

### 11.5 Dynamic Import for Code Splitting
`DashboardPage` dynamically imports the resume API module only when "Generate Sample" is clicked.

### 11.6 Print-Based PDF Export
Uses `window.print()` + CSS `@media print` rules rather than a PDF library.

### 11.7 Mixed Module Systems
Backend uses CommonJS (`tsconfig` target), frontend uses ESM (`"type": "module"` in package.json).

### 11.8 8-Step Wizard with Live Preview
Resume builder allows editing and previewing simultaneously, with AI enhancement at every text step.

---

## 12. Future Considerations

| Area | Current State | Recommendation |
|---|---|---|
| Password Reset | Stub — no email sending | Integrate Nodemailer or SendGrid |
| PDF Export | `window.print()` | Use @react-pdf/renderer (already installed) |
| Form Management | Manual useState | Use react-hook-form (already installed) |
| Error Handling | Axios 401 dispatches custom event with no listener | Add auth store listener |
| Testing | None | Add Vitest/Cypress tests |
| Security | Weak JWT secret in .env template | Generate strong random secret |
| TypeScript | Backend `any` types in some controllers | Add strict type coverage |
| Bundle Size | 500KB JS bundle | Implement lazy loading for routes |
