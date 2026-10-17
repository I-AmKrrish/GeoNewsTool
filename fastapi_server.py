import os
import requests
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from langchain_groq import ChatGroq
from langchain.tools import tool
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from tavily import TavilyClient

load_dotenv()

app = FastAPI(title="GeoNewsTool FastAPI Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: Optional[str] = None
    city: Optional[str] = None

class LocationData(BaseModel):
    city: str
    country: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None

class WeatherData(BaseModel):
    temp: float
    feels_like: Optional[float] = None
    condition: str
    humidity: Optional[int] = None
    wind_speed: Optional[str] = None

class NewsItem(BaseModel):
    title: str
    snippet: str
    url: str
    source: Optional[str] = None
    published: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    tools_used: List[str] = []
    location: Optional[LocationData] = None
    weather: Optional[WeatherData] = None
    news: Optional[List[NewsItem]] = None

# Global clients
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY")) if os.getenv("TAVILY_API_KEY") else None

# Helper to fetch geocoding if only news was called
def fetch_geocoding(city_name: str) -> Optional[LocationData]:
    key = os.getenv("OPENWEATHER_API_KEY")
    if not key:
        return None
    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        resp = requests.get(url, params={"q": city_name, "appid": key, "units": "metric"}, timeout=5).json()
        if str(resp.get("cod")) == "200" and "coord" in resp:
            return LocationData(
                city=resp.get("name", city_name),
                country=resp.get("sys", {}).get("country"),
                lat=resp["coord"].get("lat"),
                lon=resp["coord"].get("lon")
            )
    except Exception:
        pass
    return None

# Agent setup matching agents2.py
llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0,
)
checkpointer = MemorySaver()

@app.get("/")
def root():
    return {"status": "ok", "service": "GeoNewsTool Agent Backend"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    user_query = req.message or req.city or ""
    if not user_query.strip():
        return ChatResponse(
            reply="Please provide a message or city name to explore.",
            tools_used=[],
            location=None,
            weather=None,
            news=None
        )

    # State stores for tool outputs in current request
    captured_tools = []
    captured_weather: Optional[WeatherData] = None
    captured_location: Optional[LocationData] = None
    captured_news: Optional[List[NewsItem]] = None

    @tool
    def get_weather(city: str) -> str:
        """Get current weather of a city"""
        nonlocal captured_weather, captured_location, captured_tools
        captured_tools.append("get_weather")
        OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
        if not OPENWEATHER_API_KEY:
            return "Weather API key not configured."

        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {"q": city, "appid": OPENWEATHER_API_KEY, "units": "metric"}
        try:
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            if str(data.get("cod")) != '200':
                return f"City not found: {data.get('message', 'could not fetch weather')}"

            weather_desc = data["weather"][0]["description"].title()
            temp = float(data["main"]["temp"])
            feels_like = float(data["main"]["feels_like"])
            humidity = int(data["main"]["humidity"])
            wind_speed = f"{data['wind'].get('speed', 0)} m/s" if "wind" in data else None

            # Store structured weather
            captured_weather = WeatherData(
                temp=temp,
                feels_like=feels_like,
                condition=weather_desc,
                humidity=humidity,
                wind_speed=wind_speed
            )

            # Store structured location
            if "coord" in data:
                captured_location = LocationData(
                    city=data.get("name", city),
                    country=data.get("sys", {}).get("country"),
                    lat=data["coord"].get("lat"),
                    lon=data["coord"].get("lon")
                )

            return (f"Weather in {city}: {weather_desc}, "
                    f"temperature {temp}°C (feels like {feels_like}°C), "
                    f"humidity {humidity}%")
        except Exception as e:
            return f"Error fetching weather: {e}"

    @tool
    def get_news(city: str) -> str:
        """Get the latest news about the city. Input should be a city name like 'Bhopal' or 'Bengaluru'."""
        nonlocal captured_news, captured_tools, captured_location
        captured_tools.append("get_news")
        if not tavily_client:
            return "News client not configured."

        try:
            response = tavily_client.search(
                query=f"latest news in {city}",
                search_depth="basic",
                max_results=5
            )
            results = response.get("results", [])
            if not results:
                return f"No recent news found for {city}."

            items = []
            news_summary = f"Latest news in {city}:\n\n"
            for i, item in enumerate(results, 1):
                title = item.get("title", "No title")
                content = item.get("content", "")[:200]
                url = item.get("url", "")
                source_domain = url.split("/")[2].replace("www.", "") if "/" in url else "Verified Source"
                
                items.append(
                    NewsItem(
                        title=title,
                        snippet=content,
                        url=url,
                        source=source_domain,
                        published="Recent"
                    )
                )
                news_summary += f"{i}. {title}\n{content}...\nSource: {url}\n\n"

            captured_news = items
            return news_summary
        except Exception as e:
            return f"Error fetching news for {city}: {str(e)}"

    # Create fresh agent instance for request with captured tools
    agent = create_react_agent(
        model=llm,
        tools=[get_weather, get_news],
        prompt="You are a helpful city assistant that can provide the latest weather and news about any city.",
    )

    try:
        agent_result = agent.invoke(
            {"messages": [{"role": "user", "content": user_query}]}
        )
        reply_content = agent_result["messages"][-1].content
    except Exception as e:
        reply_content = f"I encountered an error processing your request: {str(e)}"

    # If news was called but weather was not, attempt geocoding for the city
    if "get_news" in captured_tools and not captured_location:
        # Extract city from agent tool calls
        for msg in agent_result.get("messages", []):
            if isinstance(msg, AIMessage) and msg.tool_calls:
                for tc in msg.tool_calls:
                    if tc["name"] == "get_news" and "city" in tc.get("args", {}):
                        captured_location = fetch_geocoding(tc["args"]["city"])
                        break

    # If tools_used is empty or all fields null -> strictly return reply only
    unique_tools = list(dict.fromkeys(captured_tools))

    return ChatResponse(
        reply=reply_content,
        tools_used=unique_tools,
        location=captured_location,
        weather=captured_weather,
        news=captured_news
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fastapi_server:app", host="0.0.0.0", port=8000, reload=True)
