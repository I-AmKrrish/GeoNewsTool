# ============================================================
# STEP 1 — Load environment variables
# ============================================================
from dotenv import load_dotenv
load_dotenv()

import os
import requests

from langchain_mistralai import ChatMistralAI
from langchain.tools import tool
from langchain_core.messages import HumanMessage, ToolMessage
from tavily import TavilyClient
from rich import print


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

    print("DEBUG:", data)
    if str(data.get("cod")) != '200':
        return f"City not found: {data.get('message', 'could not fetch weather')}"

    weather_desc = data["weather"][0]["description"]
    temp = data["main"]["temp"]
    feels_like = data["main"]["feels_like"]
    humidity = data["main"]["humidity"]

    return (f"Weather in {city}: {weather_desc}, "
            f"temperature {temp}°C (feels like {feels_like}°C), "
            f"humidity {humidity}%")


# Quick standalone test
# print(get_weather.invoke({"city": "Guwahati"}))


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
            content = item.get("content", "")[:200]  # trim to keep it concise
            url = item.get("url", "")
            news_summary += f"{i}. {title}\n{content}...\nSource: {url}\n\n"

        return news_summary

    except Exception as e:
        return f"Error fetching news for {city}: {str(e)}"


# Quick standalone test
# print(get_news.invoke({"city": "Guwahati"}))


# ============================================================
# STEP 4 — LLM Setup + Tool Binding
# ============================================================
llm = ChatMistralAI(model="mistral-small-2506")

tools = {
    "get_weather": get_weather,
    "get_news": get_news
}

llm_with_tool = llm.bind_tools([get_weather, get_news])


# ============================================================
# STEP 5 — Agent Loop (with human-in-the-loop tool confirmation)
# ============================================================
messages = []

print("city intelligence sysyem ")
print("type 'exit' to quit")

while True:
    user = input("You:")
    if user.lower() == "exit":
        break
    messages.append(HumanMessage(user))

    while True:
        result = llm_with_tool.invoke(messages)
        messages.append(result)

        # if tool is required
        if result.tool_calls:
            for tool_call in result.tool_calls:
                tool_name = tool_call['name']

                # human in the loop
                confirm = input(f'Do you want to execute {tool_name}?(y/n): ')
                if confirm.lower() == 'n':
                    print("tool call denied and i cannot get the latest information")
                    break

                # execute tool
                tool_result = tools[tool_name].invoke(tool_call)

                messages.append(ToolMessage(
                    content=tool_result,
                    tool_call_id=tool_call['id']
                ))
            continue
        else:
            print(result.content)
            break


# ============================================================
# CODE FLOWCHART (explained)
# ============================================================
#
#   [Load .env] 
#        |
#        v
#   [Define get_weather tool] --(test call)--> prints weather for "Guwahati"
#        |
#        v
#   [Define get_news tool] --(test call)--> prints news for "Guwahati"
#        |
#        v
#   [Create ChatMistralAI LLM instance]
#        |
#        v
#   [Bind get_weather + get_news to the LLM as callable tools]
#        |
#        v
#   +------------------------------------------------------+
#   |               MAIN AGENT LOOP (outer while)           |
#   |  1. Wait for user input                               |
#   |  2. If input == "exit" -> break out of program         |
#   |  3. Append HumanMessage(user_input) to messages[]      |
#   |                                                        |
#   |  +--------------------------------------------------+ |
#   |  |            INNER LOOP (tool-resolution loop)      | |
#   |  |  a. Send full messages[] history to LLM           | |
#   |  |  b. Append LLM's response (AIMessage) to messages |
#   |  |  c. Does result.tool_calls contain any tool call? |
#   |  |     -> YES:                                       |
#   |  |          for each tool_call:                      |
#   |  |            - Ask user for y/n confirmation         |
#   |  |            - If 'n': deny, print message, break    |
#   |  |            - If 'y': execute tool_call via         |
#   |  |              tools[tool_name].invoke(tool_call)    |
#   |  |            - Wrap result in ToolMessage, append    |
#   |  |              to messages[] (so LLM sees the        |
#   |  |              tool's output on the next inner loop) |
#   |  |          -> continue inner loop (re-invoke LLM     |
#   |  |             now that it has tool results)          |
#   |  |     -> NO:                                         |
#   |  |          -> print(result.content) i.e. final       |
#   |  |             natural-language answer                |
#   |  |          -> inner loop ends implicitly (no continue)|
#   |  +--------------------------------------------------+ |
#   |  4. Back to outer loop -> wait for next user input     |
#   +------------------------------------------------------+
#
#   KEY IDEA:
#   The inner loop exists because a single user question might
#   require MULTIPLE round-trips to the LLM: first the LLM decides
#   it needs a tool, gets the tool's result appended as context,
#   then it's invoked AGAIN so it can either call another tool
#   or produce the final answer. The loop only exits (falls to
#   else branch) once the LLM responds with plain text and no
#   further tool_calls.