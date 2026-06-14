# IntelliTeach — Real-time Classroom Intelligence Platform

> Turns every student signal into an immediate teaching action, live during a lecture.

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

---

## Folder Structure

```
intelliteach-vibe/
├── backend/                  # FastAPI — routes, models, services
├── intelliteach-dashboard-frontend/   # React + Vite + TypeScript
├── docs/                     # Architecture documentation
├── .gitignore
├── requirements.txt
└── README.md
```

---

## Run Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
> Runs at `http://localhost:8000`  
> Create a `.env` file with your `DATABASE_URL` and `SECRET_KEY`

### Frontend
```bash
cd intelliteach-dashboard-frontend
bun install
bun run dev
```
> Runs at `http://localhost:5173`  
> Create a `.env` file with `VITE_API_URL=http://localhost:8000`

---

## Docs

See [`docs/architecture.md`](docs/architecture.md) for full system architecture, service layer breakdown, and data flow.