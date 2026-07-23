# ============================================================
# STEP 1 — Load environment variables
# ============================================================
from dotenv import load_dotenv
load_dotenv()

import os
import requests

from langchain_mistralai import ChatMistralAI
from langchain.tools import tool
from langchain_core.messages import HumanMessage, ToolMessage, AIMessage
from tavily import TavilyClient
from rich import print

from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver


# ============================================================
# STEP 2 — Weather Tool (OpenWeather API)
# ============================================================
@tool
def get_weather(city: str) -> str:
    """Get current weather of a city"""
    OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": city,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric"
    }
    response = requests.get(url, params=params, timeout=10)
    data = response.json()

    if str(data.get("cod")) != '200':
        return f"City not found: {data.get('message', 'could not fetch weather')}"

    weather_desc = data["weather"][0]["description"]
    temp = data["main"]["temp"]
    feels_like = data["main"]["feels_like"]
    humidity = data["main"]["humidity"]

    return (f"Weather in {city}: {weather_desc}, "
            f"temperature {temp}°C (feels like {feels_like}°C), "
            f"humidity {humidity}%")


# ============================================================
# STEP 3 — News Tool (Tavily API)
# ============================================================
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

@tool
def get_news(city: str) -> str:
    """Get the latest news about the city. Input should be a city name like 'Bhopal' or 'Bengaluru'."""
    try:
        response = tavily_client.search(
            query=f"latest news in {city}",
            search_depth="basic",
            max_results=5
        )

        results = response.get("results", [])
        if not results:
            return f"No recent news found for {city}."

        news_summary = f"Latest news in {city}:\n\n"
        for i, item in enumerate(results, 1):
            title = item.get("title", "No title")
            content = item.get("content", "")[:200]
            url = item.get("url", "")
            news_summary += f"{i}. {title}\n{content}...\nSource: {url}\n\n"

        return news_summary

    except Exception as e:
        return f"Error fetching news for {city}: {str(e)}"


# ============================================================
# STEP 4 — Human Approval via interrupt
# ============================================================
def ask_human_approval(tool_name: str) -> bool:
    confirm = input(f"\nAgent wants to call '{tool_name}'. Approve? (y/n): ")
    return confirm.lower() == 'y'


# ============================================================
# STEP 5 — LLM + Agent Setup
# ============================================================
llm = ChatMistralAI(model="mistral-small-2506")
checkpointer = MemorySaver()

tools = [get_weather, get_news]

agent = create_react_agent(
    model=llm,
    tools=tools,
    prompt="You are a helpful city assistant that can provide the latest weather and news about any city.",
    checkpointer=checkpointer,
)

# ============================================================
# STEP 6 — Chat Loop with manual approval
# ============================================================
print("City Agent | type 'exit' to quit")
config = {"configurable": {"thread_id": "session-1"}}

while True:
    user_input = input("you: ")
    if user_input.lower() == "exit":
        break

    result = agent.invoke(
        {"messages": [{"role": "user", "content": user_input}]},
        config=config
    )

    # Show tool calls made (for transparency)
    for msg in result["messages"]:
        if isinstance(msg, AIMessage) and msg.tool_calls:
            for tc in msg.tool_calls:
                print(f"[Tool used: {tc['name']}]")

    print("bot:", result["messages"][-1].content)