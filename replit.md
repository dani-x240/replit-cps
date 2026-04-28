# CPS Mobile - Crime Prevention System

## Overview

CPS Mobile is a mobile-first crime reporting and police management application for Uganda. It enables citizens to report crimes using an AI-powered assistant with voice support, while providing police officers with role-based dashboards for case management and district oversight. The system uses a PostgreSQL database with session-based authentication and integrates Replit AI services for chat, voice transcription, and image generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme variables for citizen (green) and police (blue) roles
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Forms**: React Hook Form with Zod schema validation

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Authentication**: Passport.js with LocalStrategy, express-session stored in PostgreSQL
- **Database ORM**: Drizzle ORM with PostgreSQL dialect

### Data Storage
- **Database**: PostgreSQL with connection pooling via `pg.Pool`
- **Schema Location**: `shared/schema.ts` using Drizzle table definitions
- **Migrations**: Drizzle Kit with `db:push` for schema synchronization
- **Session Storage**: connect-pg-simple for persistent sessions

### Authentication Flow
- Session-based authentication with 30-day cookie expiration
- Passport LocalStrategy validates username/password against database
- User roles: `citizen`, `police_io`, `police_oc`, `police_dpc`, `admin`
- Protected routes check session state via `/api/user` endpoint

### Project Structure
```
client/           # React frontend application
  src/
    components/   # Reusable UI components
    pages/        # Route page components (CitizenSOS, CitizenChat, etc.)
    hooks/        # Custom React hooks for data fetching
    lib/          # Utilities and query client setup
server/           # Express backend
  routes.ts       # API route registration (incl. /api/sos endpoints)
  storage.ts      # Database access layer
  db.ts           # PostgreSQL connection
  replit_integrations/  # AI service integrations
shared/           # Shared types and schemas
  schema.ts       # Drizzle database schema
  routes.ts       # API contract definitions with Zod
```

### Key Citizen Features
- **SOS Emergency** (`/citizen/sos`): 3-second press-and-hold to trigger alert, 6-second window to choose Call 999 or Video record, automatic 30-second audio capture if no choice is made. GPS coordinates are sent with the alert.
- **Invisible Mode**: Swipe up on the dashboard to enable anonymous reporting (swipe down to disable). UI switches to dark/anonymous styling.
- **AI Crime Assistant** (`/citizen/chat`): Voice and text chat with the AI assistant for guidance and report drafting.
- **Demo accounts**: `ogwang_daiel` / `btynatqnavry` (citizen), `otim_joshua` / `iam josh` (IO), `jowie` / `123456789` (OC), `dpc_demo` / `password123` (DPC), `admin` / `password123` (admin).

### Build System
- Development: Vite dev server with HMR proxied through Express
- Production: Vite builds to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Key dependencies bundled into server for faster cold starts

## External Dependencies

### AI Integrations (Replit)
- **Chat**: OpenAI-compatible API for conversational AI via `AI_INTEGRATIONS_OPENAI_API_KEY`
- **Voice**: Speech-to-text and text-to-speech using WebM/Opus audio with ffmpeg conversion
- **Images**: GPT-based image generation via `gpt-image-1` model

### Database
- PostgreSQL via `DATABASE_URL` environment variable
- Drizzle ORM for type-safe queries and schema management

### Authentication
- `SESSION_SECRET` environment variable for session signing
- PostgreSQL session store for persistence across restarts

### Third-Party Libraries
- **UI**: Radix UI primitives, Lucide icons, Embla carousel
- **Forms**: React Hook Form, Zod validation
- **Dates**: date-fns for formatting
- **Audio**: Web Audio API with AudioWorklet for streaming playback