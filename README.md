# OrbitKit Admin (orbitkit-fe)

Admin dashboard for OrbitKit — productized M365 / Power Platform automation packs.

Built with Next.js 16 (App Router + Turbopack dev), React 19, TypeScript, Tailwind CSS 4,
Redux Toolkit, axios, react-hook-form + zod, and a lean shadcn-style UI kit.

## Getting started

```bash
cp env.example .env.local   # set NEXT_PUBLIC_API_URL
npm install
npm run dev                 # http://localhost:3001
```

The admin talks to the OrbitKit Express backend (default `http://localhost:4000`).
Authentication uses a session cookie (`session_backend`); all requests are sent with
`withCredentials: true` via the shared axios instance in `src/lib/axios.ts`.

## Scripts

- `npm run dev` — dev server on port 3001 (Turbopack)
- `npm run build` — production build
- `npm run start` — serve the production build on port 3001
- `npm run lint` — ESLint

## Structure

```
src/
  app/
    (dashboard)/        admin shell + pages (guarded by AuthLoader)
    login/              login page
    layout.tsx          Redux + theme + Toaster providers
    globals.css         Tailwind 4 + design tokens
  components/
    auth-loader.tsx     client guard: loads /auth/me, gates on role=admin
    ui/                 shadcn-style primitives (button, input, card, label, sonner)
  lib/
    axios.ts            shared axios instance (baseURL + withCredentials)
    utils.ts            cn() helper
  redux/
    store.ts, provider.tsx, hooks.ts
    slices/auth.slice.ts
    thunks/auth.thunks.ts
```
