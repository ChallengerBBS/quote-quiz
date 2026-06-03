# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A famous quote quiz game where users guess the author of displayed quotes. Supports two modes: Binary (Yes/No) and Multiple Choice (3 options). Built as a full-stack web application.

## Tech Stack

- **Frontend**: React + TypeScript, Bootstrap for styling, Jest for tests
- **Backend**: ASP.NET Core Web API (Controllers pattern), Entity Framework Core, PostgreSQL
- **Testing**: NUnit + Moq (backend), Jest (frontend)
- **Infrastructure**: Docker + Docker Compose for PostgreSQL

## Commands

Once the project is scaffolded, the expected commands are:

**Frontend** (from `frontend/`):
```
npm start          # Dev server
npm run build      # Production build
npm test           # Jest tests
npm test -- --testPathPattern=<file>  # Single test file
```

**Backend** (from `backend/`):
```
dotnet build       # Build solution
dotnet run         # Run API
dotnet test        # NUnit tests
dotnet test --filter "FullyQualifiedName~TestName"  # Single test
dotnet ef migrations add <Name>   # Add EF migration
dotnet ef database update         # Apply migrations
```

**Database**:
```
docker-compose up -d   # Start PostgreSQL container
docker-compose down    # Stop containers
```

## Architecture

The app is split into `frontend/` and `backend/` directories.

### Backend (ASP.NET Core)

Three controllers handle the main domains:
- `UsersController` — CRUD for users
- `QuotesController` — CRUD for quotes (each quote has an author and wrong-answer options for multiple choice)
- `AchievementsController` — Records user answers and exposes game history with sorting/filtering

Database entities: `User`, `Quote`, `UserAnswer` (tracks which quote, which user, correct/incorrect, timestamp). `Quote` also holds the multiple-choice distractor options.

EF Core `AppDbContext` maps these entities to PostgreSQL. Connection string comes from environment/config (not hardcoded).

### Frontend (React + TypeScript)

Two pages:
- **Main Page** (`/`) — Fetches a random quote, renders answer buttons based on current mode, shows feedback ("Correct!" / "Sorry, you are wrong! The correct answer is X"), then a "Next" button
- **Settings Page** (`/settings`) — Toggles between Binary and Multiple Choice mode; mode is persisted (localStorage or context)

API calls are centralized in a `services/api.ts` module. Game mode state is managed via React Context or a state management hook shared across pages.

### Data Flow

1. Frontend reads saved mode from Settings
2. `GET /api/quotes/random` returns a quote with author and (if multiple-choice mode) distractor options
3. User submits answer → `POST /api/answers` records the result
4. Frontend displays feedback, waits for "Next" click, then fetches the next quote

## Key Design Decisions

- The backend validates answers and persists them; the frontend does not contain author data before the user answers to prevent cheating via client-side inspection.
- Multiple choice distractors are stored with the quote in the database, not generated on the fly.
- Bootstrap component classes match the wireframes in `requirements.pdf`.
