# Notezy

Notezy is a desktop-style notes app built with a Next.js frontend, an Express API, MongoDB persistence, JWT authentication, and a soft glassmorphism + paper workspace UI.

## Features

- Email/password signup and login
- JWT protected note routes
- User-specific notes
- Create, edit, autosave, and delete notes
- Trash, restore, and permanent delete
- Favorites and pinned notes
- Search and category filtering
- Custom categories
- Persistent note colors
- Rich editor toolbar
- Desktop-inspired responsive layout

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Framer Motion
- Tailwind CSS
- Lucide React

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Project Structure

```txt
notezy/
  client/   Next.js frontend
  server/   Express API
  docs/     Architecture and technical explanation
```

## Local Setup

Install dependencies in the root, client, and server folders if needed:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

Create environment files from the examples:

```txt
client/.env.local
server/.env
```

Client:

```env
NEXT_PUBLIC_API_URL=http://localhost:5050
```

Server:

```env
PORT=5050
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

Run the full app:

```bash
npm run dev
```

Frontend:

```txt
http://localhost:3000
```

Backend:

```txt
http://localhost:5050
```

## Build

```bash
npm run build
```

Or separately:

```bash
npm run build:client
npm run build:server
```

## Deployment

Deploy the backend first on a Node hosting provider such as Render or Railway.

Backend environment variables:

```env
PORT=5050
MONGO_URI=
JWT_SECRET=
CLIENT_URL=https://your-notezy-client.vercel.app
```

Deploy the frontend on Vercel using `client` as the root directory.

Frontend environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-notezy-api-url.com
```

## Documentation

The complete technical explanation is available in:

```txt
docs/ARCHITECTURE.md
```
