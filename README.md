# Notezy
A modern desktop-style note-taking application built with Next.js, TypeScript, Express, MongoDB, and JWT authentication.

## Features

* User Authentication (Signup/Login)
* User-Specific Notes
* Autosave
* Search & Categories
* Favorites & Pinned Notes
* Trash & Restore
* Note Color Persistence
* Rich Text Editing
* Responsive Desktop-Inspired UI

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Framer Motion

### Backend

* Node.js
* Express
* MongoDB
* Mongoose
* JWT Authentication

## Local Setup

```bash
npm install
npm install --prefix client
npm install --prefix server
npm run dev
```

## Environment Variables

### Client

```env
NEXT_PUBLIC_API_URL=http://localhost:5050
```

### Server

```env
MONGO_URI=
JWT_SECRET=
CLIENT_URL=http://localhost:3000
PORT=5050
```

## Author

Rohit Sanjay
