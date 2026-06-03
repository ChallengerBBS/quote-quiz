# Quote Quiz Game

A famous quote quiz game where players guess the author of displayed quotes. Supports two game modes: **Binary** (Yes / No) and **Multiple Choice** (pick from 4 options).

## Tech Stack

| Layer    | Technology                                                       |
| -------- | ---------------------------------------------------------------- |
| Frontend | React 18, TypeScript, Bootstrap 5, React Router 6                |
| Backend  | ASP.NET Core Web API (.NET 8), Entity Framework Core             |
| Database | SQLite (file-based, no server required)                          |
| Testing  | NUnit + Moq (backend), Vitest + React Testing Library (frontend) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later (includes npm)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [dotnet-ef CLI tool](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) — install once globally:

```bash
dotnet tool install --global dotnet-ef
```

No Docker or database server needed — SQLite stores everything in a single file (`quotequiz.db`) created automatically on first run.

---

## Project Structure

```
quote-quiz-game/
├── frontend/          # React + TypeScript app (port 3000)
├── backend/
│   ├── QuoteQuiz.API/     # ASP.NET Core Web API (port 5000)
│   └── QuoteQuiz.Tests/   # NUnit test project
├── scripts/           # Utility scripts
└── README.md
```

---

## Setup

**For your ease, you can directly run the single-step setup script `scripts/start-all.ps1` or execute the steps below manually.**

### 1. Apply database migrations

From the `backend/` directory:

```bash
cd backend
dotnet ef database update --project QuoteQuiz.API
```

This creates `quotequiz.db` in the `QuoteQuiz.API` folder with all tables and seed data. User IDs auto-increment starting from **1338**. The pre-seeded admin account has ID **1337** — set your `id` in `localStorage` to `1337` to access it.

### 2. Start the backend API

```bash
cd backend
dotnet run --project QuoteQuiz.API
```

The API will be available at `http://localhost:5000`.

### 3. Install frontend dependencies

```bash
cd frontend
npm install
```

### 4. Start the frontend dev server

```bash
npm start
```

The app will open at `http://localhost:3000`. The dev server proxies all `/api` requests to `http://localhost:5000`.

---

## First Run

On first load the app will redirect you to a **Create Profile** page. Enter a username to start playing — no automatic guest accounts are created. Admin privileges are granted through the admin panel only (`/admin/users`).

---

## Environment & Configuration

The SQLite database path is set in `backend/QuoteQuiz.API/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Data Source=quotequiz.db"
}
```

The path is relative to the working directory when the app runs. To use an absolute path or a different location, update this value.

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
npm test -- FileName
```

---

## Common Commands

```bash
# Add a new EF Core migration
cd backend
dotnet ef migrations add <MigrationName> --project QuoteQuiz.API

# Apply pending migrations
cd backend
dotnet ef database update --project QuoteQuiz.API

# Reset the database (delete the file and re-apply)
rm backend/QuoteQuiz.API/quotequiz.db
cd backend && dotnet ef database update --project QuoteQuiz.API

# Production frontend build
cd frontend
npm run build
```

---

## PowerShell Scripts

The `scripts/` directory contains PowerShell helpers for Windows. Run them from the repo root or from within the `scripts/` folder — they resolve paths relative to their own location.

| Script          | What it does                                                                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start-all.ps1` | **One-command startup.** Opens the backend in a new window (applies migrations first), waits for the backend health endpoint, then opens the frontend in a new window. |
| `start-be.ps1`  | Applies EF Core migrations then starts the backend on `http://localhost:5000`.                                                                                         |
| `start-fe.ps1`  | Waits up to 30 s for the backend health endpoint, runs `npm install` if `node_modules` is missing, then starts the frontend dev server on `http://localhost:3000`.     |

### Recommended usage

**Start everything at once (simplest):**

```powershell
.\scripts\start-all.ps1
```

This opens separate terminal windows for the backend and frontend. You can close the launcher window once both are running.

**Start services individually (useful for development):**

```powershell
# Terminal 1 — backend
.\scripts\start-be.ps1

# Terminal 2 — frontend
.\scripts\start-fe.ps1
```

---

## Game Modes

| Mode                | Description                                                                             |
| ------------------- | --------------------------------------------------------------------------------------- |
| **Binary**          | A quote and an author name are shown. Answer Yes or No: did this author say this quote? |
| **Multiple Choice** | A quote is shown with 4 author options. Pick the correct one.                           |

Mode preference is saved to `localStorage` and persists across sessions.
