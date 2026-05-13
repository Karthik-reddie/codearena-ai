# CodeArena AI

A gamified coding learning platform where users learn DSA and development through AI-assisted challenges, multiplayer contests, adaptive quizzes, and roadmap tracking.

## Tech Stack

### Frontend
- **React 19** + Vite
- **Tailwind CSS** (dark theme)
- **Framer Motion** (animations)
- **Redux Toolkit** (state management)
- **React Router** (navigation)
- **Monaco Editor** (code editor)
- **Socket.IO** (real-time)

### Backend
- **FastAPI** (Python 3.12)
- **PostgreSQL 16** (database)
- **SQLAlchemy** (async ORM)
- **JWT** (authentication)
- **WebSockets** (multiplayer)
- **Redis** (caching/leaderboards)
- **OpenAI API** (AI mentor)

## Features

### Authentication
- JWT login/signup with secure password hashing (bcrypt)
- Google OAuth integration
- Forgot password flow with email reset tokens
- Role-based access control (student/admin)

### User Dashboard
- XP and leveling system with progress bars
- Streak tracking and daily goals
- Coding activity heatmap (GitHub-style)
- Recent submission history

### Coding Challenges
- Problem statements with difficulty levels and tags
- Monaco code editor with syntax highlighting
- Test case execution and submission history
- Timer support for timed challenges
- XP rewards on successful solutions

### Multiplayer Battles
- Real-time battle rooms with WebSocket communication
- Matchmaking via room codes
- Live code submission and comparison
- Winner determination and XP rewards

### AI Coding Mentor
- Chat interface powered by OpenAI GPT-4o-mini
- Beginner/Intermediate/Expert explanation modes
- AI-generated adaptive quizzes
- Code explanation and weakness analysis

### Learning Roadmaps
- DSA, Frontend, Backend, and AI/ML roadmaps
- Topic-level progress tracking
- Percentage completion visualization

### Admin Panel
- Platform statistics dashboard
- User management (search, activate/deactivate, role changes)
- Challenge CRUD operations

### Leaderboard
- Global and weekly rankings
- XP-based scoring
- User stats comparison

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.12+ (for local backend dev)

### Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/codearena-ai.git
cd codearena-ai

# Start all services
docker compose up --build

# Access the app
# Frontend: http://localhost
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install .

# Start PostgreSQL and Redis (via Docker or locally)
docker compose up postgres redis -d

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Run the server
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Access: http://localhost:5173
```

## Sample Test Accounts

| Role    | Email                  | Password     |
|---------|------------------------|--------------|
| Admin   | admin@codearena.ai     | Admin@123    |
| Student | student@codearena.ai   | Student@123  |

## Database Schema

### Core Tables
- **users** - User accounts with XP, levels, streaks
- **challenges** - Coding problems with test cases
- **submissions** - User code submissions and results
- **battles** - Multiplayer battle rooms
- **roadmaps** - Learning path definitions
- **user_roadmap_progress** - Per-user roadmap completion
- **notifications** - User notification feed
- **daily_activities** - Per-day activity tracking

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Login |
| GET | /api/challenges/ | List challenges |
| POST | /api/challenges/submit | Submit solution |
| POST | /api/battles/create | Create battle |
| POST | /api/battles/join/{code} | Join battle |
| GET | /api/roadmaps/ | List roadmaps |
| GET | /api/leaderboard/global | Global rankings |
| POST | /api/ai/chat | Chat with AI mentor |
| POST | /api/ai/quiz | Generate quiz |
| GET | /api/dashboard/stats | User statistics |
| GET | /api/admin/stats | Admin analytics |

## Architecture

```
codearena-ai/
├── backend/
│   ├── app/
│   │   ├── api/routes/       # API endpoint handlers
│   │   ├── core/             # Config, DB, security, Redis
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic, WebSocket, seeding
│   │   └── main.py           # FastAPI application
│   ├── tests/                # pytest test suite
│   ├── alembic/              # Database migrations
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page-level components
│   │   ├── store/            # Redux store and slices
│   │   ├── services/         # API client
│   │   └── App.jsx           # Router configuration
│   └── Dockerfile
├── docker-compose.yml
├── .github/workflows/ci.yml
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql+asyncpg://postgres:postgres@localhost:5432/codearena |
| REDIS_URL | Redis connection string | redis://localhost:6379/0 |
| SECRET_KEY | JWT signing key | (change in production) |
| OPENAI_API_KEY | OpenAI API key for AI mentor | (optional) |
| GOOGLE_CLIENT_ID | Google OAuth client ID | (optional) |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret | (optional) |

## Security

- Password hashing with bcrypt
- JWT tokens with expiration
- Rate limiting via SlowAPI
- Input validation with Pydantic
- CORS configuration
- SQL injection prevention via SQLAlchemy ORM
- Environment variable management

## License

MIT
