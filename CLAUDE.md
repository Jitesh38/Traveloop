# Traveloop

A travel-focused web application.

## Stack

### Frontend (client/)
- **Framework:** React 19, Vite 8, JavaScript (JSX) — no TypeScript
- **Linting:** ESLint with React Hooks and React Refresh plugins
- **Package manager:** npm

### Backend (server/)
- **Framework:** NestJS 11 (TypeScript)
- **Database:** PostgreSQL via TypeORM 0.3
- **Auth:** bcrypt
- **File uploads:** Multer + Sharp (image processing)
- **API Docs:** Swagger / OpenAPI
- **Testing:** Jest + Supertest
- **Linting:** ESLint + Prettier

## Project Structure

```
Traveloop/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   └── vite.config.js
├── server/                  # NestJS backend
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── users/           # Users module (controller, service, entities, DTOs)
│   │   └── modules/
│   │       └── upload/      # File upload module
│   ├── shared-db/           # TypeORM migrations and datasource config
│   │   ├── migrations/
│   │   └── scripts/
│   ├── .env.example         # Copy to .env and fill in values
│   └── tsconfig.json
├── design-assets/           # Local only — gitignored
├── mockups/                 # Local only — gitignored
├── notes/                   # Local only — gitignored
├── CLAUDE.md
└── .gitignore
```

## Dev Commands

### Frontend (run from client/)
```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

### Backend (run from server/)
```bash
npm run start:dev          # Start NestJS in watch mode
npm run build              # Compile TypeScript
npm run start:prod         # Run compiled build
npm run lint               # ESLint + auto-fix
npm run test               # Unit tests
npm run test:e2e           # End-to-end tests
npm run migration:create   # Create a new migration file
npm run migration:generate # Generate migration from entity changes
npm run migration:run      # Apply pending migrations
```

## UI Color Palette

Always use **only** these colors for any UI work. Do not introduce colors outside this palette.

| Color | Hex | Usage |
|---|---|---|
| Slate Blue | `#767F9E` | Text color, button text |
| Warm Gold | `#DAA464` | Components, accents |
| Light Gold | `#DEC384` | Components, accents |
| Cream | `#E8DDB4` | Background color, button backgrounds |

## Git

- Active branch convention: `<name>-feature` (e.g. `jalay-feature`)

## Private / Sensitive Files

Never commit:
- `server/.env` (copy from `.env.example` and fill in locally)
- Anything in `design-assets/`, `mockups/`, or `notes/` (root .gitignore)
