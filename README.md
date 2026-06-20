# Notezy

> A polished, desktop-inspired personal productivity app for capturing, organizing, and revisiting notes.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express)](https://expressjs.com/)

Notezy combines a tactile sticky-note interface with practical productivity features: rich-text editing, autosave, categories, search, themes, keyboard shortcuts, responsive layouts, and installable PWA support.

## Live Demo

**Live frontend:** Deployment URL pending.

The repository currently contains Railway configuration for the API, but no public frontend deployment URL is recorded. Add the production frontend URL here after deployment.

### Demo Access

Open the login screen and select **🚀 Try Demo Account**. No signup or credentials are required.

The demo endpoint creates the shared demo account when needed and restores three curated sample notes whenever a new demo session begins.

## Screenshot

![Notezy dashboard](docs/screenshots/notezy-dashboard.png)

## Features

- Secure email/password authentication with JWT sessions
- One-click demo workspace with seeded sample content
- User-specific notes backed by MongoDB
- Rich-text note editor with formatting tools
- Debounced autosave with Saving, Synced, and Offline states
- Manual save with `Ctrl/Cmd + S`
- Full-text note search with `Ctrl/Cmd + K`
- Create-note shortcut with `Ctrl/Cmd + N`
- Categories, favorites, pinned notes, tasks, trash, and restore
- Live note, category, favorite, pinned, and task counts
- List and grid views with animated note cards
- Light and dark themes
- Settings, profile, usage statistics, shortcuts, and notifications panels
- Toast notifications for important workspace actions
- Responsive desktop, tablet, and mobile layouts
- Mobile bottom navigation and off-canvas sidebar
- Installable PWA with offline fallback and app icons

## Tech Stack

### Frontend

| Technology | Purpose |
| --- | --- |
| Next.js 16 | App Router, routing, metadata, and production builds |
| React 19 | Component-driven UI and application state |
| TypeScript | End-to-end type safety |
| Tailwind CSS 4 | Utility styling and responsive composition |
| Framer Motion | Sidebar, editor, card, modal, and toast animations |
| Lucide React | Consistent interface icons |

### Backend

| Technology | Purpose |
| --- | --- |
| Node.js | Server runtime |
| Express 5 | REST API and middleware |
| MongoDB | Persistent user and note storage |
| Mongoose | Schemas, validation, and database access |
| JSON Web Tokens | Stateless authentication |
| bcryptjs | Password hashing |
| express-validator | Request validation |

## Architecture

```mermaid
flowchart LR
    U["Browser / Installed PWA"] --> C["Next.js Client"]
    C -->|"JWT-authenticated REST requests"| A["Express API"]
    A --> S["Auth and Note Services"]
    S --> M[("MongoDB")]
    C --> L["Local Storage\nSession, settings, note cache"]
    C --> W["Service Worker\nApp shell and offline fallback"]
```

The frontend and backend are separate applications inside one repository:

```text
notezy/
├── client/
│   ├── app/                 # Next.js routes and global styles
│   ├── components/          # Layout, authentication, and shared UI
│   ├── features/            # Auth and notes feature modules
│   ├── public/              # PWA worker, icons, and backgrounds
│   └── shared/              # Theme and toast infrastructure
├── server/
│   └── src/
│       ├── controllers/     # HTTP request handlers
│       ├── middleware/      # JWT authentication
│       ├── models/          # Mongoose User and Note schemas
│       ├── routes/          # Auth and note endpoints
│       └── services/        # Authentication and note business logic
└── docs/screenshots/        # README media
```

## Local Setup

### Prerequisites

- Node.js 20 or newer
- npm
- A local or hosted MongoDB database

### 1. Clone the repository

```bash
git clone https://github.com/sammy00/Notezy.git
cd Notezy
```

### 2. Install dependencies

```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 3. Configure the client

Copy `client/.env.example` to `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5050
```

### 4. Configure the server

Copy `server/.env.example` to `server/.env` and provide your own secrets:

```env
MONGO_URI=mongodb://127.0.0.1:27017/notezy
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:3000
PORT=5050
```

Never commit real environment variables or production secrets.

### 5. Start Notezy

```bash
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:5050](http://localhost:5050)

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run the client and API together |
| `npm run build` | Create production builds for both applications |
| `npm run build:client` | Build only the Next.js client |
| `npm run build:server` | Compile only the Express API |
| `npm run lint` | Run the frontend ESLint checks |
| `npm run start:server` | Start the compiled API |

## API Overview

```text
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/demo
GET    /api/auth/me

GET    /api/notes
POST   /api/notes
GET    /api/notes/:id
PATCH  /api/notes/:id
DELETE /api/notes/:id
```

Protected note routes accept the JWT in the `auth-token` header or as a Bearer token.

## Production Notes

- Deploy `client` to a Next.js-compatible host such as Vercel.
- Deploy `server` using the included Railway configuration or another Node.js host.
- Set `NEXT_PUBLIC_API_URL` to the deployed API URL.
- Set `CLIENT_URL` to the deployed frontend origin.
- PWA installation requires HTTPS in production.

## Author

Built by [Rohit Sanjay](https://github.com/sammy00).
