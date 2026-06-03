# Quote Quiz Game

A famous quote quiz game where players guess the author of displayed quotes. Supports two game modes: **Binary** (Yes / No) and **Multiple Choice** (pick from 4 options).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Bootstrap 5, React Router 6 |
| Backend | ASP.NET Core Web API (.NET 8), Entity Framework Core |
| Database | PostgreSQL 16 |
| Infrastructure | Docker + Docker Compose |
| Testing | NUnit + Moq (backend), Jest + React Testing Library (frontend) |

---

## Prerequisites

Make sure the following are installed before setting up the project:

- [Node.js](https://nodejs.org/) v18 or later (includes npm)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)
- [dotnet-ef CLI tool](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) — install once globally:

```bash
dotnet tool install --global dotnet-ef
```

---

## Project Structure

```
quote-quiz-game/
├── frontend/          # React + TypeScript app (port 3000)
├── backend/
│   ├── QuoteQuiz.API/     # ASP.NET Core Web API (port 5000)
│   └── QuoteQuiz.Tests/   # NUnit test project
├── scripts/           # Utility scripts
├── docker-compose.yml # PostgreSQL container
└── README.md
```

---

## Setup

### 1. Start the database

```bash
docker-compose up -d
```

This starts a PostgreSQL 16 container on port **5432** with:

| Setting | Value |
|---|---|
| Database | `quotequiz` |
| Username | `quotequiz` |
| Password | `quotequiz123` |

Verify it's healthy:

```bash
docker-compose ps
```

### 2. Apply database migrations

From the `backend/` directory:

```bash
cd backend
dotnet ef database update --project QuoteQuiz.API
```

This creates all tables with the initial schema. User IDs auto-increment starting from **1338**.
First user that is already seeded has id **1337** and has admin priviliges.
In order to access this admin profile all you have to do is to change your id in localStorage to **1337**.

### 3. Start the backend API

```bash
cd backend
dotnet run --project QuoteQuiz.API
```

The API will be available at `http://localhost:5000`.

### 4. Install frontend dependencies

```bash
cd frontend
npm install
```

### 5. Start the frontend dev server

```bash
npm start
```

The app will open at `http://localhost:3000`. The dev server proxies all `/api` requests to `http://localhost:5000`.

---

## First Run

On first load the app will redirect you to a **Create Profile** page. Enter a username to start playing — no automatic guest accounts are created. Admin privileges are granted through the admin panel only (`/admin/users`).

---

## Environment & Configuration

The backend connection string is in `backend/QuoteQuiz.API/appsettings.json` and matches the Docker Compose defaults out of the box. To use a different database, update the `DefaultConnection` value:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=quotequiz;Username=quotequiz;Password=quotequiz123"
}
```

---

## Running Tests

**Backend:**

```bash
cd backend
dotnet test
```

Run a single test by name:

```bash
dotnet test --filter "FullyQualifiedName~TestName"
```

**Frontend:**

```bash
cd frontend
npm test
```

Run a single test file:

```bash
npm test -- --testPathPattern=FileName
```

---

## Common Commands

```bash
# Stop the database container
docker-compose down

# Stop and wipe all database data
docker-compose down -v

# Add a new EF Core migration
cd backend
dotnet ef migrations add <MigrationName> --project QuoteQuiz.API

# Production frontend build
cd frontend
npm run build
```

---

## PowerShell Scripts

The `scripts/` directory contains PowerShell helpers for Windows. Run them from the repo root or from within the `scripts/` folder — they resolve paths relative to their own location.

| Script | What it does |
|---|---|
| `start-all.ps1` | **One-command startup.** Starts the DB, waits for it to be healthy, opens the backend in a new window (applies migrations first), waits for the backend health endpoint, then opens the frontend in a new window. |
| `start-db.ps1` | Runs `docker-compose up -d` and polls until PostgreSQL is healthy. Pass `-KeepAlive` to keep the container running in the foreground — pressing Enter will `docker-compose down` cleanly. |
| `start-be.ps1` | Applies EF Core migrations then starts the backend on `http://localhost:5000`. Pass `-SkipDb` to skip the database startup step (useful when the DB is already running). |
| `start-fe.ps1` | Waits up to 30 s for the backend health endpoint, runs `npm install` if `node_modules` is missing, then starts the frontend dev server on `http://localhost:3000`. |

### Recommended usage

**Start everything at once (simplest):**

```powershell
.\scripts\start-all.ps1
```

This opens separate terminal windows for the database, backend, and frontend. You can close the launcher window once all three are running.

**Start services individually (useful for development):**

```powershell
# Terminal 1 — database
.\scripts\start-db.ps1 -KeepAlive

# Terminal 2 — backend (skips re-starting the DB)
.\scripts\start-be.ps1 -SkipDb

# Terminal 3 — frontend
.\scripts\start-fe.ps1
```

---

## Game Modes

| Mode | Description |
|---|---|
| **Binary** | A quote and an author name are shown. Answer Yes or No: did this author say this quote? |
| **Multiple Choice** | A quote is shown with 4 author options. Pick the correct one. |

Mode preference is saved to `localStorage` and persists across sessions.
