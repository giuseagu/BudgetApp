# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web-based Budget App with:
- **Frontend**: React (JavaScript/TypeScript)
- **Backend**: Python (FastAPI or Flask)
- **Database**: PostgreSQL

## Project Structure (planned)

```
BudgetApp/
├── frontend/        # React app
├── backend/         # Python API
└── docker-compose.yml
```

## Common Commands

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm test             # Run tests
npm run lint         # Lint code
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload  # Start dev server (FastAPI)
pytest                     # Run tests
pytest tests/test_foo.py   # Run a single test file
```

### Database
```bash
docker-compose up -d postgres   # Start PostgreSQL via Docker
psql -U postgres -d budgetapp   # Connect to DB
```

## Architecture

- **Frontend** communicates with the backend via REST API (JSON).
- **Backend** exposes API endpoints and handles business logic.
- **PostgreSQL** stores all persistent data (users, transactions, budgets, categories).
- Use `docker-compose.yml` to orchestrate local development services (PostgreSQL, optionally backend).

## GitHub & Version Control

### Setup iniziale
Al primo avvio del progetto, creare la repository su GitHub:
```bash
git init
git remote add origin https://github.com/<username>/BudgetApp.git
gh repo create BudgetApp --public --source=. --remote=origin --push
```

### Regola per i commit
**Ad ogni sessione di lavoro o milestone significativa**, eseguire commit e push con una descrizione dettagliata:
```bash
git add <files>
git commit -m "$(cat <<'EOF'
Titolo breve del cambiamento

- Dettaglio 1: cosa è stato aggiunto/modificato e perché
- Dettaglio 2: ...
- Dettaglio 3: ...
EOF
)"
git push origin main
```

Le descrizioni dei commit devono spiegare **cosa** è stato fatto e **perché**, in modo da poter ricostruire la storia del progetto in ogni momento.

### .gitignore
Escludere sempre: `venv/`, `node_modules/`, `.env`, `__pycache__/`, `*.pyc`, `.DS_Store`.

## Environment Variables

Backend expects a `.env` file in `backend/`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/budgetapp
SECRET_KEY=...
```

Frontend expects a `.env` file in `frontend/`:
```
VITE_API_URL=http://localhost:8000
```
