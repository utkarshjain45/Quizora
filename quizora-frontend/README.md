# Quizora

Quizora — a full-stack quiz application (Spring Boot backend + React + Vite frontend).

## Overview

Quizora provides APIs and a web UI to create, administer, and take quizzes. The repository contains:

- `quizora-backend`: Spring Boot (Java 21, Maven) backend providing REST APIs and authentication.
- `quizora-frontend`: React + TypeScript + Vite frontend application.

## Tech stack

- Backend: Java 21, Spring Boot, Spring Security, JPA (PostgreSQL)
- Frontend: React, TypeScript, Vite
- Dev tooling: Maven wrapper (`mvnw` / `mvnw.cmd`), Node / npm, Docker (optional)

## Repository structure

- `quizora-backend/` — backend source, `pom.xml`, Dockerfile, `application.yml`.
- `quizora-frontend/` — frontend source, `package.json`, Vite config.

## Prerequisites

- Java 21 (or use the included Maven wrapper)
- Maven (optional if using the wrapper)
- Node.js (16+) and npm
- PostgreSQL (or run via Docker)
- Docker & Docker Compose (optional)

## Environment variables

The backend reads several environment variables (configured in `quizora-backend/src/main/resources/application.yml`):

- `DB_URL` — JDBC URL for PostgreSQL (e.g. `jdbc:postgresql://db:5432/quizora`)
- `DB_USERNAME` — database username
- `DB_PASSWORD` — database password
- `JWT_SECRET` — secret used to sign JWT tokens
- `JWT_EXPIRATION` — JWT expiration (numeric or ISO value used by your config)
- `FRONTEND_URL` — allowed frontend origin for CORS / links

Set these in your shell, in a `.env` file if using Docker Compose, or in your runtime environment.

## Running locally (recommended quick start)

1. Start PostgreSQL (local or Docker).

2. Backend (using Maven wrapper)

Windows PowerShell:

```powershell
cd quizora-backend
.\mvnw.cmd spring-boot:run
```

macOS / Linux:

```bash
cd quizora-backend
./mvnw spring-boot:run
```

The backend runs on port `8080` by default.

3. Frontend

```bash
cd quizora-frontend
npm install
npm run dev
```

The Vite dev server typically runs on `http://localhost:5173`.

This script hits `/api/v1/auth/login` and `/api/v1/admin/quiz/create` as an example.

## Docker (optional)

There is a `Dockerfile` and `docker-compose.yml` in `quizora-backend`. To run backend + PostgreSQL via Docker Compose:

```bash
cd quizora-backend
docker-compose up --build
```

Adjust the compose file or environment variables as needed.

## Build for production

- Backend: build the JAR

```bash
cd quizora-backend
./mvnw package   # or .\mvnw.cmd package on Windows
```

- Frontend: produce production build

```bash
cd quizora-frontend
npm run build
```

## Testing

Run backend tests with Maven:

```bash
cd quizora-backend
./mvnw test
```

Frontend linting:

```bash
cd quizora-frontend
npm run lint
```

## API highlights

- Authentication: `POST /api/v1/auth/login` 
- Admin create quiz: `POST /api/v1/admin/quiz/create`
- Quiz-taking endpoints and other controllers are under `src/main/java/.../controller` in the backend.

Explore the backend sources in `quizora-backend/src/main/java/com/quizora/Quizora/controller` for full API routes.

## Contributing

Contributions welcome. Suggested workflow:

1. Fork the repo
2. Create a feature branch
3. Run tests and linting locally
4. Open a PR with a clear description
