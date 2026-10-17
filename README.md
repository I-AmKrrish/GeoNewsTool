# 🌍 GeoNewsTool — AI City Assistant

[![React](https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-ReAct_Agent-f59e0b)](https://langchain-ai.github.io/langgraph/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An intelligent, real-time **City Exploration & Telemetry Assistant**. GeoNewsTool combines an interactive **3D WebGL globe**, live meteorological data, verified global journalism feeds, and a **LangGraph ReAct agent** with Groq LLMs into a modern, responsive web application.

---

## ✨ Features

- 🌐 **Interactive 3D Globe (`cobe`)** — Real-time WebGL globe featuring ambient lighting, smooth pointer drag interaction, and animated coordinate targeting for searched cities.
- 🌤️ **Live Atmosphere & Meteorological Telemetry** — Real-time temperature, "feels-like", humidity, wind speed, and weather condition badges powered by OpenWeatherMap.
- 📰 **Verified Multi-Source Headlines** — Real-time city news articles, publisher sources, and external links powered by Tavily Search.
- 🤖 **LangGraph ReAct Agent** — Autonomous agent reasoning that dynamically selects tools (`get_weather`, `get_news`) or holds natural conversation based on user intent.
- 💬 **Adaptive Interface (Chat vs. Location Report)**:
  - **Conversational Queries** (e.g., *"hi"*, *"how are you"*): Renders clean chat bubbles formatted with `react-markdown` and `remark-gfm`.
  - **City Queries** (e.g., *"What is happening in Tokyo?"*): Renders the full city dashboard with coordinates, live weather cards, and verified news headlines.
- ⚡ **Zero-Placeholder Guarantee** — Cards and telemetry are rendered strictly when verified data exists; never displays fake or fallback coordinates.

---

## 🛠️ Architecture & Tech Stack

```text
┌────────────────────────────────────────────────────────┐
│               React 19 + Vite Frontend                 │
│  - Tailwind CSS v4 & Framer Motion                     │
│  - Interactive 3D Globe (cobe)                         │
│  - Omnibar search & Rich Markdown rendering            │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP POST /chat
                           ▼
┌────────────────────────────────────────────────────────┐
│                    FastAPI Backend                     │
│  - CORS Middleware & REST API Schema                   │
│  - LangGraph ReAct Agent Loop                          │
│  - Groq LLM (openai/gpt-oss-120b)                      │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
    OpenWeatherMap API                Tavily API
  (Weather & Coordinates)          (Verified News)
```

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend UI** | **React 19**, **Vite**, **Tailwind CSS v4** | Ultra-responsive SPA interface |
| **3D Visualization** | **`cobe`** | Lightweight, high-performance WebGL globe |
| **Animations & Icons** | **Framer Motion**, **Lucide React** | Fluid UI transitions and modern iconography |
| **Markdown** | **`react-markdown`**, **`remark-gfm`** | Structured AI briefing and reply rendering |
| **Backend API** | **FastAPI**, **Uvicorn**, **Pydantic** | RESTful service with CORS support |
| **AI Agent** | **LangGraph**, **LangChain**, **Groq** | Autonomous ReAct decision-making agent |
| **Live Telemetry** | **OpenWeatherMap**, **Tavily** | Live weather data and verified news headlines |

---

## 📁 Repository Structure

```text
GeoNewsTool/
├── frontend/                     # React 19 + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── CityDashboard.jsx   # Weather, news cards & chat bubbles
│   │   │   ├── Header.jsx          # Brand header & live status pills
│   │   │   ├── InteractiveGlobe.jsx# 3D cobe globe with pin markers
│   │   │   └── Omnibar.jsx         # Floating search & shortcut bar
│   │   ├── services/
│   │   │   ├── api.js              # Clean API client for POST /chat
│   │   │   └── mockData.js         # Verified city datasets & mock mode
│   │   ├── App.jsx                 # Main application layout
│   │   └── index.css               # Tailwind CSS v4 design tokens
│   ├── package.json
│   └── vite.config.js
│
├── fastapi_server.py             # FastAPI backend with LangGraph ReAct agent
├── agents2.py                    # Standalone CLI agent loop with memory
├── newssummarizer.py             # Standalone news summarizer runnable
├── requirements.txt              # Python dependencies
├── .env.example                  # Environment variables template
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm**

---

### 1. Backend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/I-AmKrrish/GeoNewsTool.git
   cd GeoNewsTool
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv .venv
   # Windows PowerShell
   .\.venv\Scripts\Activate.ps1
   # macOS / Linux
   source .venv/bin/activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt fastapi uvicorn
   ```

4. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key
   OPENWEATHER_API_KEY=your_openweather_api_key
   TAVILY_API_KEY=your_tavily_api_key
   ```

   | Key | Purpose | Get it from |
   |---|---|---|
   | `GROQ_API_KEY` | Fast LLM inference | [console.groq.com](https://console.groq.com) |
   | `OPENWEATHER_API_KEY` | Weather & coordinates | [openweathermap.org](https://home.openweathermap.org/api_keys) |
   | `TAVILY_API_KEY` | Real-time news search | [tavily.com](https://tavily.com) |

5. **Start the FastAPI backend server**:
   ```bash
   python fastapi_server.py
   ```
   *The backend will be live at `http://localhost:8000` (interactive Swagger docs at `http://localhost:8000/docs`).*

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start Vite development server**:
   ```bash
   npm run dev
   ```
   Open **`http://localhost:5173/`** in your browser.

---

## 📡 API Specification

### `POST /chat`

Processes conversational messages or city queries.

#### Request Body
```json
{
  "message": "What is the weather in Tokyo?"
}
```

#### Response (`200 OK`)
```json
{
  "reply": "The current weather in **Tokyo** is clear sky with a temperature of 16°C...",
  "tools_used": ["get_weather"],
  "location": {
    "city": "Tokyo",
    "country": "JP",
    "lat": 35.6895,
    "lon": 139.6917
  },
  "weather": {
    "temp": 16.2,
    "feels_like": 15.6,
    "condition": "Clear Sky",
    "humidity": 64,
    "wind_speed": "3.0 m/s"
  },
  "news": null
}
```

*When general conversational text is sent (e.g. `"hello"`), `tools_used` is `[]`, and `location`, `weather`, and `news` are `null`.*

---

## 💻 Standalone Terminal Mode

You can also run the CLI agent directly in your terminal:
```bash
python agents2.py
```

---

## 🔒 Security

API credentials and environment keys should never be committed to source control. Ensure `.env` is listed in `.gitignore` at all times.

---

## 🙋 Author

**Krrish** — [@I-AmKrrish](https://github.com/I-AmKrrish)
