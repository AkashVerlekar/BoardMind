# BoardMind 🧠

BoardMind is a premium AI-powered Executive Decision Intelligence Platform designed for the modern C-suite. It aggregates business data, analyzes strategic and operational metrics, identifies anomalies, and leverages AI (Google Gemini) to generate actionable recommendations.

## Features

- **Executive Dashboard:** A consolidated view of the business through a high-level Morning Brief.
- **Dynamic Analytics:** Real-time strategic (revenue, profit) and operational (customer satisfaction, employee burnout) KPIs.
- **Historical Charting:** Interactive visualizations of trailing 30-day financial performance powered by our Enterprise Simulator.
- **Business Health Score:** A unified metric aggregating Financial, Customer, and Employee health dimensions.
- **Automated Decision Engine:** An expandable rules-based registry that detects anomalies and flags actionable insights.
- **AI-Powered Recommendations:** Google Gemini integration provides contextual summaries, assignments, and strategic recommendations.
- **Interactive Workflows:** Assign recommendations to employees, approve/reject proposals, and mark objectives as completed.

## Architecture

BoardMind utilizes a clean, separated frontend and backend architecture:

- **Frontend:** Next.js (App Router), React, Zustand (State Management), Tailwind CSS (Theming), Recharts (Visualizations).
- **Backend:** FastAPI (Python), SQLAlchemy (ORM), Pydantic (Validation).
- **Database:** PostgreSQL (Primary), SQLite (Development Fallback).
- **AI Layer:** Google Generative AI (Gemini 1.5 Flash).
- **Simulator:** A built-in Enterprise World Simulator that generates realistic chronological business data.

*For detailed architectural documentation, see [System Architecture](docs/system_architecture.md).*

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 14+ |
| **Styling** | Tailwind CSS (Dark Mode by default) |
| **State Management** | Zustand |
| **Backend Framework** | FastAPI (Python 3.10+) |
| **ORM & Database** | SQLAlchemy & PostgreSQL |
| **AI Integration** | Google Generative AI SDK |

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (or SQLite for fallback testing)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
```

## Configuration

Create a `.env` file in the `backend` directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/boardmind
GEMINI_API_KEY=your_google_gemini_api_key
```
*(Note: If `GEMINI_API_KEY` is omitted, the AI client will fallback to mock responses for testing purposes).*

## Running Locally

1. **Seed the Simulator (Generates DB & Data):**
```bash
cd backend
python -m app.simulator.generate_world
```

2. **Start the FastAPI Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```
*API will run at http://127.0.0.1:8000*

3. **Start the Next.js Frontend:**
```bash
cd frontend
npm run dev
```
*App will run at http://localhost:3000*

## Screenshots

*(Insert screenshots of the Dashboard, Analytics, and Recommendations workflow here)*

## Documentation

Explore the complete documentation for further details:
- [System Architecture](docs/system_architecture.md)
- [API Documentation](docs/api_documentation.md)
- [Database Documentation](docs/database_documentation.md)
- [Developer Guide](docs/developer_guide.md)
- [User Guide](docs/user_guide.md)
- [Deployment Guide](docs/deployment_guide.md)
- [Known Limitations](docs/known_limitations.md)
- [Future Roadmap](docs/future_roadmap.md)
