# Notezy Client

The Notezy web client is built with Next.js 16, React 19, and TypeScript. It contains the notes workspace, task dashboard, templates, responsive navigation, theme system, PWA shell, and API clients.

For full setup, architecture, API, and deployment documentation, see the [repository README](../README.md).

## Commands

```bash
npm run dev      # Start Next.js on port 3000
npm run build    # Create a production build
npm run start    # Serve the production build
npm run lint     # Run ESLint
```

Set the API origin in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5050
```
