# Architecture — IntelliTeach (AMEP)

> **Real-time Classroom Intelligence Platform**  
> Turns every student signal into an immediate teaching action.

---

## The Core Loop

```
Teacher explains
      │
      ▼
Students signal (Got It / Confused / MCQ / Poll)
      │
      ▼
EngagementEngine analyzes signals in real-time
      │
      ▼
Teacher receives ONE intervention suggestion
      │
      ▼
Teacher acts → loop repeats
```

---

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                   │
│                                                         │
│   React + Vite + TypeScript + shadcn/ui + Tailwind     │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Dashboard │ │LiveClass │ │Analytics │ │ Mastery  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Questions │ │Recordings│ │ Projects │ │ Reports  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ REST (JSON)
                        │ TanStack Query
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                    Routers                      │   │
│  │  /auth  /dashboard  /live  /analytics           │   │
│  │  /mastery  /questions  /recordings              │   │
│  │  /projects  /reports                            │   │
│  └───────────────────┬─────────────────────────────┘   │
│                      │                                  │
│  ┌───────────────────▼─────────────────────────────┐   │
│  │                  Services                       │   │
│  │                                                 │   │
│  │  EngagementEngine   MasteryEngine               │   │
│  │  InterventionEngine SyllabusMapper              │   │
│  │  QuestionGenerator  STTService (Whisper)        │   │
│  │  AuthService (JWT + bcrypt)                     │   │
│  └───────────────────┬─────────────────────────────┘   │
│                      │  SQLAlchemy ORM                  │
│  ┌───────────────────▼─────────────────────────────┐   │
│  │                   Models                        │   │
│  │  User · Class · Session · EngagementSignal      │   │
│  │  Mastery · Homework · Question · Recording      │   │
│  │  Transcript · Project · PeerReview              │   │
│  └───────────────────┬─────────────────────────────┘   │
└──────────────────────┼──────────────────────────────────┘
                       │
                       ▼
             ┌─────────────────┐
             │   PostgreSQL    │
             │    amep_db      │
             └─────────────────┘
```

---

## Backend — Service Layer

| Service | Responsibility |
|---|---|
| `EngagementEngine` | Computes `engagement_percent` + `confusion_percent` from live signals; outputs one `suggested_action` |
| `MasteryEngine` | Updates per-student per-concept mastery (0–100) from MCQ accuracy using weighted formula |
| `InterventionEngine` | Decides intervention type (recap / Q&A / re-explain / move on) based on confusion % + timeline |
| `SyllabusMapper` | Rule-based NLP — maps transcript keywords to syllabus topics |
| `QuestionGenerator` | Generates MCQ + short-answer questions from concepts; LLM-upgrade ready |
| `STTService` | Whisper integration for audio transcription; mock fallback available |
| `AuthService` | JWT auth via `python-jose`; password hashing via `passlib` (bcrypt) |

---

## Frontend — Page Map

| Page | Purpose |
|---|---|
| `Index.tsx` | Dashboard — stat cards, live class CTA, weekly engagement chart, recent classes |
| `LiveClass.tsx` | Hero page — engagement gauge, student signal buttons, intervention alerts, confusion timeline |
| `Analytics.tsx` | Engagement timeline, confusion before/after intervention, participation distribution |
| `Mastery.tsx` | Per-concept mastery heatmap, adaptive homework list |
| `Questions.tsx` | MCQ/short answer generator — concept selector + difficulty picker |
| `Recordings.tsx` | Past recordings list, transcription trigger, concept map visualization |
| `Projects.tsx` | Team project tracker, peer review, soft skills radar |
| `Reports.tsx` | Downloadable engagement and mastery reports |

---

## Data Flow — Live Class Session

```
1. Teacher starts session       → POST /live/start
2. Student taps "Confused"      → POST /live/signal  (type: confused)
3. EngagementEngine runs        → computes confusion_percent
4. Threshold crossed (>30%)     → InterventionEngine fires
5. Teacher sees alert           → GET  /live/status  (intervention card)
6. Teacher acts + marks done    → POST /live/intervention-complete
7. Session ends                 → POST /live/end
8. Analytics stored             → GET  /analytics/timeline
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TypeScript, shadcn/ui, Tailwind CSS, Recharts, TanStack Query, React Router v6 |
| Backend | FastAPI, SQLAlchemy, PostgreSQL, Pydantic, Uvicorn |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Audio/NLP | OpenAI Whisper, rule-based SyllabusMapper |
| Package Manager | Bun (frontend), pip (backend) |
| CI | GitHub Actions |

---

## Roles

| Role | Access |
|---|---|
| `Teacher` | Start/end sessions, view analytics, generate questions, manage classes |
| `Student` | Send signals, view own mastery, submit peer reviews |
| `Admin` | Full platform access, user management |