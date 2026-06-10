# Notezy Architecture Guide

This file explains the main concepts, technologies, implementation choices, and alternatives used in the Notezy app. It is both a learning guide and a lightweight technical design document.

Notezy is a full-stack note-taking app built with:

- Next.js
- React
- TypeScript
- CSS / Tailwind utility classes / inline style objects
- Framer Motion
- Lucide React icons
- Express
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing
- browser `fetch`
- localStorage caching

The goal of Notezy is not to behave like a basic CRUD notes demo. The app is designed like a desktop-style creative note workspace with glassmorphism, sticky-note cards, warm paper details, authentication, user-specific notes, autosave, categories, favorites, pinned notes, trash, and restore.

---

## 0. Tech Stack Summary

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind utility classes
- Inline dynamic style objects
- Framer Motion
- Lucide React
- Browser `fetch`
- localStorage

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- express-validator
- CORS
- dotenv

### Deployment

- Frontend: Vercel or any Next.js hosting platform
- Backend: Render, Railway, Fly.io, or similar Node hosting
- Database: MongoDB Atlas
- Environment variables for API URL, MongoDB URI, JWT secret, and client URL

---

## 0.1 Architecture Diagram

```txt
Browser
  |
  v
Next.js Frontend
  |
  |  HTTPS requests with JWT auth-token
  v
Express API
  |
  |  Mongoose models and queries
  v
MongoDB Atlas
```

Detailed flow:

```txt
User
  |
  v
Login / Signup
  |
  v
JWT saved in localStorage
  |
  v
Protected /app route
  |
  v
Notezy Desktop Workspace
  |
  v
Notes API
  |
  v
MongoDB user-specific notes
```

---

## 0.2 Current Features

- Authentication
- Signup
- Login
- Logout with confirmation
- Protected app route
- User-specific notes
- No default/demo notes for new users
- Create note
- Read notes
- Update note
- Soft delete to Trash
- Restore from Trash
- Permanent delete
- Autosave with debounce
- Saving/Saved status
- Search
- Default categories
- Custom categories
- Rename/delete custom categories
- Favorites
- Pinned notes
- Color persistence
- Rich text toolbar
- Highlight options
- Bullet/numbered/checklist options
- Image/file attachment entry points
- Fullscreen editor
- Desktop-style minimize/close/open UI
- Empty editor state
- Light/dark theme foundation

---

## 0.3 Database Schema

```txt
User
  _id
  name
  email
  password
  createdAt
  updatedAt

Note
  _id
  title
  content
  preview
  tone
  category
  starred
  pinned
  archived
  trashed
  user -> User._id
  createdAt
  updatedAt
```

Relationship:

```txt
User 1 ──────── many Notes

Each note belongs to exactly one user through:

note.user = user._id
```

Why this matters:

- Every note query is filtered by authenticated `user.id`.
- Users cannot access another user's notes.
- The note list, trash, favorites, pinned notes, and categories all operate on the logged-in user's data.

---

## 0.4 Security

Security decisions currently implemented:

- Passwords are hashed using bcrypt.
- JWT is used for authentication.
- Protected note routes require a valid token.
- The backend middleware attaches authenticated `user.id` to each request.
- Note update/delete checks ownership before modifying data.
- MongoDB URI is stored in environment variables.
- JWT secret is stored in environment variables.
- Client URL is configured through environment variables.
- Demo/default note seeding was removed before deployment.

Important future security upgrades:

- Move JWT from localStorage to HTTP-only cookies.
- Add refresh tokens or shorter token expiry.
- Add rate limiting for login/signup.
- Add stronger password rules.
- Add centralized API error logging.
- Add CSRF protection if cookie auth is introduced.

---

## 0.5 Roadmap

- Notifications and reminders
- Category sync in MongoDB
- Cloud file attachments
- Rich text editor upgrade with Lexical or TipTap
- HTTP-only cookie authentication
- Note sharing
- PWA support
- Offline mode
- Drag-and-drop note ordering
- Backend search for large note collections
- Tests for auth, notes, categories, trash, and editor behavior

---

## 0.6 Documentation Decision

This document intentionally lives at:

```txt
docs/ARCHITECTURE.md
```

The root `README.md` should stay shorter and focus on:

- project overview
- screenshots
- setup instructions
- environment variables
- deployment links
- feature summary

This architecture document is longer because it explains concepts, design decisions, implementation details, and alternatives.

The most important alternatives are covered around major decisions:

- authentication
- database
- state management
- editor implementation
- backend architecture
- API client choice

Smaller alternatives are mentioned only when they help explain why the current implementation exists.

---

## 1. Project Structure

The project is split into two main apps:

```txt
notezy/
  client/
    app/
    components/
    features/
    shared/

  server/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
```

### Why This Structure?

The frontend and backend are separated so they can be deployed independently.

The client handles:

- UI
- note editor
- sidebar
- authentication screens
- API calls
- local cache
- animations

The server handles:

- signup/login
- JWT verification
- MongoDB connection
- note CRUD
- user-specific note ownership

### Alternative

We could have used a full-stack Next.js app with API routes.

We did not choose that because:

- The Express server is easier to understand for backend learning.
- MongoDB, routes, controllers, middleware, and services are clearer in a separate backend.
- It is better for practicing MERN-style architecture.

---

## 2. HTML Concepts Used

React eventually renders HTML in the browser. In Notezy, we use semantic HTML elements where possible.

Examples:

- `button` for clickable actions
- `input` for login/search/category input
- `section` for app regions
- `article` for note cards
- `h1`, `h2`, `h3` for headings
- `p` for text
- `img` for Notezy icon

### Where It Is Implemented

- `client/components/layout/Sidebar.tsx`
- `client/components/layout/Navbar.tsx`
- `client/features/notes/components/NoteCard.tsx`
- `client/features/notes/components/NoteEditor.tsx`
- `client/components/auth/AuthScreen.tsx`

### Why Buttons Instead Of Divs?

We use `button` for actions because:

- It is keyboard accessible.
- It has correct browser semantics.
- Screen readers understand it as clickable.

### Alternative

We could use `div onClick`.

We avoided that because it is less accessible and needs extra keyboard handling.

---

## 3. CSS Concepts Used

Notezy uses a mixture of:

- Tailwind utility classes
- inline style objects
- CSS variables
- global CSS
- gradients
- shadows
- blur / glassmorphism
- responsive sizing

### Important CSS Concepts

#### Flexbox

Used for horizontal and vertical alignment.

Example areas:

- Sidebar rows
- Navbar search/action buttons
- Bottom editor toolbar

#### CSS Grid

Used for main layout and note list layout.

Example:

```ts
gridTemplateColumns:
  viewMode === "grid" ? "1fr" : "clamp(260px, 21vw, 330px) minmax(0, 1fr)"
```

This creates:

```txt
Note List | Editor
```

#### Positioning

We use:

- `relative`
- `absolute`
- `fixed`
- `zIndex`

Examples:

- popup menus
- editor fullscreen mode
- note card pins
- floating toolbar
- desktop icon/taskbar icon

#### Glassmorphism

Glassmorphism is created using:

```css
background: rgba(...)
backdrop-filter: blur(...)
box-shadow: ...
border: 1px solid rgba(...)
```

Implemented in:

- `client/components/layout/AppLayout.tsx`
- `client/features/notes/NoteSpace.tsx`
- `client/shared/theme/DesignSystem.tsx`

#### Skeuomorphism

Skeuomorphism means making digital UI look like a physical object.

In Notezy:

- paper cards have torn edges
- note editor looks like cream paper
- notes have push pins
- papers have shadows and texture
- editor has ruled lines

Implemented in:

- `client/features/notes/components/NoteCard.tsx`
- `client/features/notes/components/NoteEditor.tsx`
- `client/shared/theme/notesThemes.ts`

### Why Inline Styles?

Many visual values are dynamic:

- note color depends on `tone`
- selected note changes shadows
- theme mode changes glass color
- animation states change transform/shadow

Inline style objects make those dynamic styles easier to calculate directly in TypeScript.

### Alternative

We could move everything to CSS modules or Tailwind classes.

We did not fully do that because dynamic note colors, paper shadows, and editor states are easier to express as JavaScript objects.

---

## 4. Tailwind Concepts Used

Tailwind is used mostly for layout utilities and quick sizing.

Examples:

```tsx
className="relative h-screen w-screen overflow-hidden"
className="flex items-center justify-between gap-4"
className="absolute inset-0 pointer-events-none"
```

### Where It Is Used

- `client/components/desktop/NotezyDesktop.tsx`
- `client/components/layout/AppLayout.tsx`
- `client/components/layout/Navbar.tsx`
- `client/components/layout/Sidebar.tsx`

### Why Not Tailwind For Everything?

Notezy has many dynamic visual styles.

For example:

```ts
backgroundColor: t.bg
boxShadow: isActive ? activeShadow : normalShadow
```

Those values come from TypeScript objects and component state.

Tailwind is excellent for static classes, but less convenient for complex dynamic paper styles.

### Alternative

We could use Tailwind theme tokens and class variants.

We did not use that fully because the app is highly visual and custom.

---

## 5. JavaScript Concepts Used

### Variables

Variables store values such as:

- selected note id
- auth token
- search query
- active filter
- API URL

Example:

```ts
const NOTE_SEARCH_EVENT = "notezy:set-note-search";
```

### Functions

Functions are used to separate logic.

Examples:

- `createBlankNote`
- `toCreatePayload`
- `readCachedNotes`
- `cacheNotes`
- `stripNoteHtml`
- `formatRelativeNoteDate`

### Arrays

Arrays store lists:

- notes
- category items
- toolbar options
- color options

Example:

```ts
const CATEGORY_ITEMS = [
  { label: "Personal", icon: User },
  { label: "Work", icon: Briefcase },
  { label: "Journal", icon: BookOpen },
  { label: "Ideas", icon: Map },
];
```

### Objects

Objects are used for:

- note data
- theme tokens
- API payloads
- style objects

Example:

```ts
{
  title,
  preview,
  content,
}
```

### Promises / Async Await

API calls use `async` and `await`.

Example:

```ts
const apiNotes = await fetchNotes();
```

Used in:

- `client/features/notes/api/notesApi.ts`
- `client/features/auth/authClient.ts`
- server controllers and services

### Events

Notezy uses browser custom events for communication between layout components.

Examples:

```ts
notezy:create-note
notezy:set-note-filter
notezy:set-note-search
notezy:update-note-category
```

Why?

The search bar lives in `Navbar`, the filters live in `Sidebar`, and the notes state lives in `NoteSpace`.

Custom events let them communicate without moving all state to a global store.

### Alternative

We could use Zustand, Redux, or React Context.

We did not use them yet because:

- the current event system is simple
- it avoids extra app-wide state setup
- the app is still small enough

For a larger production version, Zustand would be a good next step.

---

## 6. TypeScript Concepts Used

TypeScript adds types to JavaScript.

### Interfaces

Used for defining data shape.

Example:

```ts
export interface Note {
  id: string;
  title: string;
  content: string;
  tone: NoteTone;
  starred?: boolean;
  pinned?: boolean;
  trashed?: boolean;
}
```

Implemented in:

- `client/features/notes/types/note.ts`

### Union Types

Used for limited allowed values.

Example:

```ts
type NoteFilter = "all" | "favorites" | "pinned" | "trash" | "category";
```

This prevents invalid filter names.

### Partial

Used for updates.

Example:

```ts
changes: Partial<Note>
```

This means we can update only one field, like:

```ts
{ starred: true }
```

instead of sending the entire note.

### Why TypeScript?

TypeScript helps prevent mistakes while refactoring.

Example:

If a component needs `onRestore` but we forget to pass it, TypeScript catches that during build.

---

## 7. React Concepts Used

### Components

The UI is split into reusable components.

Examples:

- `NotezyDesktop`
- `AppLayout`
- `Sidebar`
- `Navbar`
- `NoteWorkspace`
- `NoteList`
- `NoteCard`
- `NoteEditor`
- `SideToolbar`
- `AuthScreen`

### Props

Props pass data/functions from parent to child.

Example:

```tsx
<NoteEditor
  note={selectedNote}
  onChange={updateNoteText}
  onUpdate={updateNote}
  onDelete={deleteNote}
/>
```

### State

State stores changing values.

Examples in `NoteSpace`:

```ts
const [notes, setNotes] = useState<Note[]>([]);
const [activeId, setActiveId] = useState("");
const [searchQuery, setSearchQuery] = useState("");
```

### useEffect

Used for side effects:

- loading notes
- listening to custom events
- handling keyboard shortcuts
- syncing auth user
- cleaning timeouts

### useMemo

Used for derived data.

Example:

```ts
const visibleNotes = useMemo(() => {
  // filtering logic
}, [activeCategory, activeFilter, notes, searchQuery]);
```

This avoids recalculating filtered notes unnecessarily.

### useCallback

Used for stable functions passed to effects/events.

Example:

```ts
const createAndSelectNote = useCallback(async () => {
  ...
}, [activeCategory, activeFilter]);
```

### useRef

Used for values that persist without causing re-renders.

Examples:

- timeout refs
- editor DOM ref
- menu anchor ref
- file input ref

### Why React?

React fits Notezy because:

- the UI is component-heavy
- notes are state-driven
- the editor changes frequently
- components can be reused and composed

### Alternative

We could build this with vanilla JavaScript.

We did not because managing editor state, auth state, note list state, menus, animations, and API updates would become much harder.

---

## 8. Next.js Concepts Used

Notezy uses Next.js App Router.

### App Router Pages

Important files:

```txt
client/app/page.tsx
client/app/login/page.tsx
client/app/signup/page.tsx
client/app/app/page.tsx
```

### Routes

```txt
/          redirects depending on auth
/login     login page
/signup    signup page
/app       protected Notezy app
```

### Client Components

Files using browser-only APIs have:

```ts
"use client";
```

Examples:

- localStorage
- window events
- router redirect
- editor DOM refs

### Protected Route

`client/app/app/page.tsx` checks for an auth token:

```ts
if (!getStoredAuthToken()) {
  router.replace("/login");
}
```

### Why Client-Side Protection?

The auth token is stored in localStorage, which only exists in the browser.

### Alternative

We could use HTTP-only cookies and server-side route protection.

That is more secure for a production SaaS app, but it is more complex. For Notezy MVP, localStorage JWT is simpler and good for learning/portfolio.

---

## 9. Authentication Concepts

Authentication is handled by:

Frontend:

- `client/features/auth/authClient.ts`
- `client/components/auth/AuthScreen.tsx`

Backend:

- `server/src/routes/auth.routes.ts`
- `server/src/controllers/auth.controller.ts`
- `server/src/services/auth.service.ts`
- `server/src/models/User.ts`
- `server/src/middleware/fetchuser.ts`

### Signup Flow

```txt
User submits name/email/password
↓
POST /api/auth/signup
↓
Server validates input
↓
Password is hashed with bcrypt
↓
User is saved in MongoDB
↓
JWT is created
↓
Frontend stores token
↓
Redirect to /app
```

### Login Flow

```txt
User submits email/password
↓
POST /api/auth/login
↓
Server checks user
↓
bcrypt compares password
↓
JWT is returned
↓
Frontend stores token
```

### JWT

JWT means JSON Web Token.

It proves the user is logged in.

The token is sent with note requests:

```ts
headers.set("auth-token", token);
```

### fetchuser Middleware

`fetchuser` checks the token and attaches:

```ts
req.user = { id: userId }
```

This lets note routes know which user owns the request.

### Why bcrypt?

Passwords should never be stored as plain text.

bcrypt hashes the password before storing it.

### Alternative

We could use NextAuth, Clerk, Firebase Auth, or Auth0.

We did not because:

- custom JWT auth is good backend practice
- it teaches login/signup flow clearly
- it keeps the portfolio project self-contained

---

## 10. API Concepts

The frontend communicates with backend using browser `fetch`.

### Auth API

```txt
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

### Notes API

```txt
GET    /api/notes
GET    /api/notes/fetchallnotes
GET    /api/notes/fetchtrashednotes
POST   /api/notes
GET    /api/notes/:id
PATCH  /api/notes/:id
DELETE /api/notes/:id
```

### Where API Calls Live

Frontend:

- `client/features/auth/authClient.ts`
- `client/features/notes/api/notesApi.ts`

Backend:

- `server/src/routes/*.routes.ts`
- `server/src/controllers/*.controller.ts`
- `server/src/services/*.service.ts`

### Why Services?

Controllers handle HTTP request/response.

Services handle business logic and database work.

This keeps code cleaner.

### Alternative

We could put database calls directly inside route files.

We did not because controller/service separation is easier to scale and test.

---

## 11. Axios Concepts

Notezy currently does not use Axios.

It uses browser `fetch`.

Example:

```ts
const response = await fetch(`${getApiBaseUrl()}${path}`, {
  method: "POST",
  headers,
  body: JSON.stringify(body),
});
```

### What Axios Would Do

Axios can simplify:

- base URL setup
- request interceptors
- response interceptors
- error handling
- auth header injection

Example Axios-style setup:

```ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  config.headers["auth-token"] = localStorage.getItem("auth-token");
  return config;
});
```

### Why We Did Not Use Axios

We did not need it yet because:

- the app has a small number of API calls
- `fetch` is built into the browser
- fewer dependencies makes deployment simpler

### When Axios Would Be Better

Axios would be useful if Notezy grows into:

- many API modules
- refresh token flow
- centralized toast errors
- request cancellation
- file uploads with progress bars

---

## 12. MongoDB Concepts

MongoDB stores data as documents.

Notezy uses two main collections:

- users
- notes

### User Document

Defined in:

```txt
server/src/models/User.ts
```

Fields:

```ts
name
email
password
createdAt
updatedAt
```

### Note Document

Defined in:

```txt
server/src/models/Note.ts
```

Fields:

```ts
title
content
preview
tone
category
starred
pinned
archived
trashed
user
createdAt
updatedAt
```

### User-Specific Notes

Each note has:

```ts
user: ObjectId
```

When fetching notes:

```ts
Note.find({ user: userId, archived: false, trashed: false })
```

This ensures each logged-in user sees only their own notes.

### Trash

Delete does not immediately remove a note from MongoDB.

Instead, the frontend updates:

```ts
trashed: true
```

Trash view fetches:

```ts
GET /api/notes/fetchtrashednotes
```

Permanent delete uses:

```ts
DELETE /api/notes/:id
```

### Alternative

We could use PostgreSQL.

We did not because:

- notes fit MongoDB documents well
- Mongoose makes schemas straightforward
- MongoDB is common in MERN portfolio projects

---

## 13. Mongoose Concepts

Mongoose is an ODM for MongoDB.

It gives:

- schemas
- models
- validation
- timestamps
- query helpers

Example:

```ts
const NoteSchema = new Schema(
  {
    title: { type: String, default: "", trim: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);
```

### Why Mongoose?

MongoDB itself is flexible, but Mongoose adds structure.

This helps avoid inconsistent documents.

### Alternative

We could use the native MongoDB driver.

We did not because Mongoose is easier for schemas, validation, and model methods.

---

## 14. Express Concepts

Express is the backend web framework.

### app.ts

Sets up:

- CORS
- JSON body parsing
- health route
- auth routes
- note routes

### Routes

Routes define endpoints.

Example:

```ts
router.post("/login", loginValidation, login);
```

### Controllers

Controllers receive request and response.

Example:

```ts
export const login = async (req, res) => {
  const { authToken, user } = await loginUserService(req.body);
  res.status(200).json({ success: true, authToken, user });
};
```

### Services

Services handle database/business logic.

Example:

```ts
const user = await User.findOne({ email });
```

### Middleware

Middleware runs before controllers.

Example:

```ts
fetchuser
```

It verifies JWT and attaches user information to the request.

---

## 15. Environment Variables

Environment variables keep secrets and deployment URLs out of source code.

### Client

```env
NEXT_PUBLIC_API_URL=
```

Used in:

- `client/features/auth/authClient.ts`
- `client/features/notes/api/notesApi.ts`

### Server

```env
MONGO_URI=
JWT_SECRET=
CLIENT_URL=
PORT=5050
```

Used in:

- `server/src/config/db.ts`
- `server/src/services/auth.service.ts`
- `server/src/middleware/fetchuser.ts`
- `server/src/app.ts`
- `server/src/index.ts`

### Why Not Hardcode?

Hardcoded secrets and URLs are unsafe and break deployment.

Local, staging, and production environments need different values.

---

## 16. LocalStorage Concepts

Notezy uses localStorage for:

- auth token
- auth user
- cached notes per user
- custom categories
- theme mode

### Auth Storage

```ts
localStorage.setItem("auth-token", authToken);
localStorage.setItem("notezy-user", JSON.stringify(user));
```

### Notes Cache

Cache key:

```ts
notezy-notes-cache:${userId}
```

This prevents users from seeing each other’s cached notes.

### Custom Categories

Custom categories are stored locally:

```ts
notezy-custom-categories
```

### Alternative

Custom categories could be stored in MongoDB.

We have not done that yet because categories are currently lightweight UI preferences. For multi-device sync, categories should move to the backend.

---

## 17. Auto-Save Concept

Editor text changes are debounced.

### What Debounce Means

Instead of saving every keystroke immediately, Notezy waits about 950ms after typing stops.

Implemented in:

```txt
client/features/notes/NoteSpace.tsx
```

Relevant idea:

```ts
textSaveTimeoutRef.current = window.setTimeout(() => {
  persistNoteChanges(id, changes);
}, 950);
```

### Why Debounce?

Without debounce:

- every letter sends an API request
- MongoDB gets unnecessary writes
- app feels noisy

With debounce:

- user can type smoothly
- app saves shortly after typing
- fewer API calls

### Alternative

We could save on blur only.

We did not because users expect notes to autosave even if they do not click away.

---

## 18. Search Concept

Search lives in:

```txt
client/components/layout/Navbar.tsx
```

Notes filtering happens in:

```txt
client/features/notes/NoteSpace.tsx
```

Navbar sends:

```ts
notezy:set-note-search
```

NoteSpace receives the search query and filters:

- title
- preview
- content
- category
- date

### Alternative

We could search from the backend.

We did not yet because:

- notes are already loaded client-side
- local search is instant
- this avoids extra API calls

Backend search would be better later for thousands of notes.

---

## 19. Category Concept

Default categories:

```txt
Personal
Work
Journal
Ideas
```

Custom categories can be:

- created
- renamed
- deleted

Implemented in:

```txt
client/components/layout/Sidebar.tsx
```

When a category is renamed or deleted, Sidebar dispatches:

```ts
notezy:update-note-category
```

NoteSpace updates affected notes and persists category changes.

### Why Default Categories Are Locked

Default categories keep the app organized and predictable.

Custom categories are user-created, so they can be edited/deleted.

### Alternative

All categories could be database records.

We did not build that yet because the current category system is simpler and enough for MVP.

---

## 20. Favorites, Pinned, and Trash

### Favorite

Stored as:

```ts
starred: boolean
```

Used by:

- note card star
- editor star
- sidebar Favorites filter

### Pinned

Stored as:

```ts
pinned: boolean
```

Pinned notes sort first on the backend.

### Trash

Stored as:

```ts
trashed: boolean
```

Normal delete updates:

```ts
{ trashed: true, pinned: false }
```

Trash menu shows:

- Restore
- Delete Forever

### Why Soft Delete?

Soft delete is safer.

Users can recover accidental deletes.

---

## 21. Editor Concepts

The editor is implemented in:

```txt
client/features/notes/components/NoteEditor.tsx
```

It handles:

- title editing
- content editing
- color picker
- pin/favorite
- note menu
- fullscreen
- save status
- empty state
- rich text commands

### contentEditable

The body editor uses a DOM-editable region.

This lets users format selected text.

### Selection Handling

The editor stores/restores text selection so toolbar actions can apply to selected text.

### Formatting

Toolbar actions include:

- bold
- italic
- underline
- highlighter
- bullet list
- numbered list
- checklist
- image/file attachment
- undo/redo

Implemented across:

- `NoteEditor.tsx`
- `SideToolbar.tsx`

### Alternative

We could use a full editor library like TipTap, Slate, Lexical, or ProseMirror.

We did not yet because:

- current MVP needs a lightweight editor
- custom paper styling is easier with our own layout
- editor libraries add complexity

For a production-level rich text editor, Lexical or TipTap would be a strong upgrade.

---

## 22. Framer Motion Concepts

Framer Motion is used for animations.

Examples:

- note card hover lift
- new note animation
- menu pop animation
- editor fade/slide
- profile menu animation
- category action animation

Common props:

```tsx
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
whileHover={{ y: -2 }}
whileTap={{ scale: 0.96 }}
```

### AnimatePresence

Used when elements mount/unmount.

Examples:

- dropdown menus
- profile menu
- editor menu
- empty state

### Why Framer Motion?

It gives smooth animation with less code than manual CSS transitions.

### Alternative

We could use CSS transitions only.

We did not because menus, mount/unmount animations, layout transitions, and spring motion are easier with Framer Motion.

---

## 23. Icons

Notezy uses:

```txt
lucide-react
```

Examples:

- Star
- Pin
- Trash
- Search
- Settings
- Calendar
- Bold
- Italic
- Underline

### Why Lucide?

Lucide icons are:

- clean
- consistent
- React-friendly
- easy to size and style

### Alternative

We could use Font Awesome, Heroicons, or custom SVGs.

Lucide fits Notezy’s soft desktop style better.

---

## 24. Theme and Design System

Theme code lives in:

```txt
client/shared/theme/
```

Important files:

- `ThemeProvider.tsx`
- `Theme.tsx`
- `DesignSystem.tsx`
- `notesThemes.ts`

### ThemeProvider

Provides:

- current mode
- colors
- design tokens
- toggle function

### DesignSystem

Stores shared values:

- radius
- spacing
- typography
- glass styles
- shadows
- layout dimensions

### notesThemes

Stores note colors:

- paper
- blue
- rose
- lavender
- sage
- sand
- frost
- mint
- sky
- peach

### Why Not Build Many Themes?

We kept Notezy focused on light/dark direction instead of many accent themes because the app already has many note colors.

Too many global themes would make the UI harder to control.

---

## 25. Why No Redux?

Notezy currently uses React state and custom events.

Redux was not added because:

- app state is still manageable
- fewer dependencies
- less boilerplate
- feature modules are clear

### When Redux/Zustand Would Help

Use a global store if:

- custom events become hard to trace
- many components need note state
- categories move to backend
- notifications/toasts become global

Zustand would probably fit Notezy better than Redux because it is smaller and simpler.

---

## 26. Deployment Concepts

### Frontend Build

```bash
npm run build --prefix client
```

### Backend Build

```bash
npm run build --prefix server
```

### Required Client Env

```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

### Required Server Env

```env
MONGO_URI=
JWT_SECRET=
CLIENT_URL=
PORT=5050
```

### Ignored Files

These should not be committed:

```txt
node_modules
.env
.env.local
.next
dist
build
coverage
*.tsbuildinfo
```

---

## 27. Important Flows

### New User Flow

```txt
Signup
↓
JWT saved
↓
/app opens
↓
No default demo notes
↓
Empty state shown
↓
User creates first note
```

### Create Note Flow

```txt
Click New Note
↓
Temporary note appears immediately
↓
POST /api/notes
↓
MongoDB returns saved note
↓
Temporary id is replaced with Mongo id
```

### Auto-Save Flow

```txt
User types
↓
Local UI updates immediately
↓
Saving... appears
↓
Debounce waits about 950ms
↓
PATCH /api/notes/:id
↓
Saved appears
```

### Delete Flow

```txt
Delete
↓
PATCH /api/notes/:id { trashed: true }
↓
Note disappears from All Notes
↓
Note appears in Trash
```

### Restore Flow

```txt
Open Trash
↓
Restore
↓
PATCH /api/notes/:id { trashed: false }
↓
Note returns to All Notes
```

### Permanent Delete Flow

```txt
Open Trash
↓
Delete Forever
↓
DELETE /api/notes/:id
↓
Note is removed from MongoDB
```

---

## 28. What We Could Improve Later

### Use Axios

Useful for centralized API interceptors.

### Move Categories To MongoDB

Useful for syncing custom categories across devices.

### Use Rich Text Editor Library

TipTap, Lexical, or Slate would improve formatting reliability.

### Use HTTP-Only Cookies

More secure than localStorage JWT.

### Add Backend Search

Better for large note collections.

### Add Toast Notifications

Better UX for save/delete/restore feedback.

### Add Tests

Important for production:

- auth tests
- note API tests
- editor behavior tests
- category tests

---

## 29. Summary

Notezy is built as a polished MERN-style desktop note app.

The frontend focuses on:

- desktop UI
- notes workspace
- glass desktop workspace with sticky-note and warm paper details
- animations
- search/filter/category UX
- auth screens
- autosave

The backend focuses on:

- user auth
- JWT protection
- MongoDB persistence
- user-specific notes
- note CRUD
- trash/restore support

The most important architectural decisions were:

- separate client/server apps
- MongoDB with Mongoose
- JWT auth with bcrypt
- React state plus custom events
- fetch instead of Axios
- soft delete instead of instant delete
- no demo notes for new users
- environment variables for deployment

This gives Notezy a clean MVP foundation while leaving clear upgrade paths for production-level features.
