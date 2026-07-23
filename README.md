# 🌍 GeoNewsTool

An AI-powered city assistant that fetches **real-time weather** and **latest news** for any city using a LangGraph ReAct agent, Mistral AI, and live APIs.

---

## ✨ Features

- 🌤️ **Live Weather** — Current temperature, feels-like, humidity, and conditions via OpenWeatherMap
- 📰 **Latest News** — Top 5 recent news stories for any city via Tavily Search
- 🤖 **ReAct Agent** — LangGraph-powered agent that reasons and decides which tool to call
- 💬 **Conversational Loop** — Chat naturally; the agent picks the right tool automatically
- 🧠 **Memory** — Conversation state persisted across turns using LangGraph's `MemorySaver`

---

## 🛠️ Tech Stack

| Layer | Tool |
|---|---|
| LLM | Mistral AI (`mistral-small-2506`) |
| Agent Framework | LangGraph (`create_react_agent`) |
| Weather API | OpenWeatherMap |
| News API | Tavily Search |
| Environment | Python + `python-dotenv` |

---

## 📁 Project Structure

```
GeoNewsTool/
├── agents2.py          # Main agent — weather + news tools + chat loop
├── newssummarizer.py   # Standalone news summarizer using LangChain chain
├── requirements.txt    # Dependencies
├── .env.example        # Environment variable template
└── README.md
```

---

## ⚙️ Setup

### 1. Clone the repo
```bash
git clone https://github.com/I-AmKrrish/GeoNewsTool.git
cd GeoNewsTool
```

### 2. Create and activate a virtual environment
```bash
uv venv
.\.venv\Scripts\Activate.ps1   # Windows
```

### 3. Install dependencies
```bash
uv pip install -r requirements.txt
```

### 4. Set up environment variables

Create a `.env` file in the root directory:
```
MISTRAL_API_KEY=your_mistral_api_key
TAVILY_API_KEY=your_tavily_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
```

| Key | Get it from |
|---|---|
| `MISTRAL_API_KEY` | [console.mistral.ai](https://console.mistral.ai) |
| `TAVILY_API_KEY` | [app.tavily.com](https://app.tavily.com) |
| `OPENWEATHER_API_KEY` | [openweathermap.org](https://home.openweathermap.org/api_keys) |

---

## 🚀 Usage

### Run the city assistant
```bash
python agents2.py
```

```
City Agent | type 'exit' to quit
you: What's the weather in Bengaluru?
bot: The current weather in Bengaluru is light rain, 24°C (feels like 26°C), humidity 85%.

you: Any news from Mumbai?
bot: Here are the latest news stories from Mumbai: ...

you: exit
```

### Run the news summarizer
```bash
python newssummarizer.py
```

---

## 🔒 Security Note

Never commit your `.env` file. It is listed in `.gitignore` by default. If you accidentally expose an API key, rotate it immediately from the respective provider's dashboard.

---

## 📦 Dependencies

```
langchain
langchain-core
langchain-community
langchain-mistralai
langchain-tavily
langgraph
tavily-python
python-dotenv
requests
rich
```

---

## 🙋 Author

**Krrish** — [@I-AmKrrish](https://github.com/I-AmKrrish)

---

*Built as part of learning LangGraph and agentic AI workflows.*
