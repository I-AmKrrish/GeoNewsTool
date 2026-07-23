from dotenv import load_dotenv
load_dotenv()

import os
import requests
import streamlit as st
from tavily import TavilyClient

from langchain_mistralai import ChatMistralAI
from langchain.tools import tool
from langchain_core.messages import AIMessage
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

# ============================================================
# PAGE CONFIG
# ============================================================
st.set_page_config(
    page_title="GeoNewsTool",
    page_icon="🌍",
    layout="wide",
)

# ============================================================
# CUSTOM CSS
# ============================================================
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap');

/* Base */
html, body, [class*="css"] {
    font-family: 'Inter', sans-serif;
    background-color: #0d0f14;
    color: #e2e8f0;
}

/* Hide streamlit chrome */
#MainMenu, footer, header { visibility: hidden; }
.block-container { padding: 2rem 2rem 0 2rem; max-width: 860px; margin: auto; }

/* Header */
.geo-header {
    text-align: center;
    padding: 2.5rem 0 1.5rem 0;
}
.geo-header h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 2.4rem;
    font-weight: 700;
    background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
    letter-spacing: -0.5px;
}
.geo-header p {
    color: #64748b;
    font-size: 0.95rem;
    margin: 0.4rem 0 0 0;
}

/* Status badges */
.badge-row {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin: 1rem 0 2rem 0;
    flex-wrap: wrap;
}
.badge {
    background: #1e2433;
    border: 1px solid #2d3748;
    border-radius: 20px;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    color: #94a3b8;
}
.badge span { margin-right: 0.3rem; }

/* Chat messages */
.chat-wrap {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
}
.msg-user {
    align-self: flex-end;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    color: white;
    border-radius: 18px 18px 4px 18px;
    padding: 0.75rem 1.1rem;
    max-width: 75%;
    font-size: 0.92rem;
    line-height: 1.5;
}
.msg-bot {
    align-self: flex-start;
    background: #1e2433;
    border: 1px solid #2d3748;
    color: #e2e8f0;
    border-radius: 18px 18px 18px 4px;
    padding: 0.75rem 1.1rem;
    max-width: 80%;
    font-size: 0.92rem;
    line-height: 1.6;
}
.msg-label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 0.3rem;
    opacity: 0.5;
}

/* Tool pill */
.tool-pill {
    display: inline-block;
    background: #0f2027;
    border: 1px solid #1e3a4a;
    color: #38bdf8;
    border-radius: 12px;
    padding: 0.2rem 0.65rem;
    font-size: 0.72rem;
    margin: 0.4rem 0.2rem 0 0;
    font-family: monospace;
}

/* Input area */
.stTextInput > div > div > input {
    background: #1e2433 !important;
    border: 1px solid #2d3748 !important;
    border-radius: 12px !important;
    color: #e2e8f0 !important;
    padding: 0.75rem 1rem !important;
    font-size: 0.92rem !important;
}
.stTextInput > div > div > input:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 2px rgba(59,130,246,0.15) !important;
}

/* Send button */
.stButton > button {
    background: linear-gradient(135deg, #3b82f6, #6366f1) !important;
    color: white !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 0.75rem 1.5rem !important;
    font-weight: 600 !important;
    font-size: 0.92rem !important;
    width: 100%;
    transition: opacity 0.2s;
}
.stButton > button:hover { opacity: 0.85 !important; }

/* Clear button */
.clear-btn > button {
    background: #1e2433 !important;
    color: #64748b !important;
    border: 1px solid #2d3748 !important;
}

/* Divider */
.divider { border-top: 1px solid #1e2433; margin: 1.5rem 0; }

/* Empty state */
.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #374151;
}
.empty-state .icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-state p { font-size: 0.9rem; line-height: 1.8; }

/* Suggestion chips */
.chip-row {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 1.5rem;
}
.chip {
    background: #1e2433;
    border: 1px solid #2d3748;
    border-radius: 20px;
    padding: 0.4rem 1rem;
    font-size: 0.8rem;
    color: #94a3b8;
    cursor: pointer;
}
</style>
""", unsafe_allow_html=True)


# ============================================================
# AGENT SETUP (cached so it only builds once)
# ============================================================
@st.cache_resource
def build_agent():
    tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

    @tool
    def get_weather(city: str) -> str:
        """Get current weather of a city."""
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {"q": city, "appid": os.getenv("OPENWEATHER_API_KEY"), "units": "metric"}
        data = requests.get(url, params=params, timeout=10).json()
        if str(data.get("cod")) != "200":
            return f"City not found: {data.get('message', 'unknown error')}"
        w = data["weather"][0]["description"]
        t = data["main"]["temp"]
        f = data["main"]["feels_like"]
        h = data["main"]["humidity"]
        return f"Weather in {city}: {w}, {t}°C (feels like {f}°C), humidity {h}%"

    @tool
    def get_news(city: str) -> str:
        """Get the latest news about a city."""
        try:
            resp = tavily_client.search(
                query=f"latest news in {city}", search_depth="basic", max_results=5
            )
            results = resp.get("results", [])
            if not results:
                return f"No recent news found for {city}."
            out = f"Latest news in {city}:\n\n"
            for i, item in enumerate(results, 1):
                title = item.get("title", "No title")
                content = item.get("content", "")[:200]
                url = item.get("url", "")
                out += f"{i}. **{title}**\n{content}...\n{url}\n\n"
            return out
        except Exception as e:
            return f"Error fetching news: {e}"

    llm = ChatMistralAI(model="mistral-small-2506")
    checkpointer = MemorySaver()

    agent = create_react_agent(
        model=llm,
        tools=[get_weather, get_news],
        prompt="You are a helpful city assistant. Provide concise, accurate weather and news for any city the user asks about.",
        checkpointer=checkpointer,
    )
    return agent


# ============================================================
# SESSION STATE
# ============================================================
if "messages" not in st.session_state:
    st.session_state.messages = []
if "thread_id" not in st.session_state:
    st.session_state.thread_id = "streamlit-session-1"


# ============================================================
# HEADER
# ============================================================
st.markdown("""
<div class="geo-header">
    <h1>🌍 GeoNewsTool</h1>
    <p>Real-time weather & news for any city, powered by Mistral AI</p>
</div>
<div class="badge-row">
    <div class="badge"><span>🤖</span> Mistral AI</div>
    <div class="badge"><span>🌤️</span> OpenWeatherMap</div>
    <div class="badge"><span>📰</span> Tavily Search</div>
    <div class="badge"><span>⚡</span> LangGraph ReAct</div>
</div>
""", unsafe_allow_html=True)


# ============================================================
# CHAT HISTORY
# ============================================================
if not st.session_state.messages:
    st.markdown("""
    <div class="empty-state">
        <div class="icon">🗺️</div>
        <p>Ask me about the weather or latest news<br>for any city in the world.</p>
        <div class="chip-row">
            <div class="chip">☀️ Weather in Tokyo</div>
            <div class="chip">📰 News from Mumbai</div>
            <div class="chip">🌧️ Is it raining in London?</div>
            <div class="chip">🗞️ Latest news in Bengaluru</div>
        </div>
    </div>
    """, unsafe_allow_html=True)
else:
    st.markdown('<div class="chat-wrap">', unsafe_allow_html=True)
    for msg in st.session_state.messages:
        if msg["role"] == "user":
            st.markdown(f"""
            <div class="msg-user">
                <div class="msg-label">You</div>
                {msg["content"]}
            </div>""", unsafe_allow_html=True)
        else:
            tools_used = msg.get("tools_used", [])
            tool_pills = "".join(
                f'<span class="tool-pill">⚙ {t}</span>' for t in tools_used
            )
            st.markdown(f"""
            <div class="msg-bot">
                <div class="msg-label">GeoNewsTool</div>
                {tool_pills}
                <div style="margin-top: {'0.5rem' if tool_pills else '0'}">
                    {msg["content"].replace(chr(10), '<br>')}
                </div>
            </div>""", unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)


# ============================================================
# INPUT
# ============================================================
st.markdown('<div class="divider"></div>', unsafe_allow_html=True)

col1, col2, col3 = st.columns([6, 1, 1])

with col1:
    user_input = st.text_input(
        label="message",
        placeholder="Ask about weather or news in any city...",
        label_visibility="collapsed",
        key="chat_input"
    )
with col2:
    send = st.button("Send →", use_container_width=True)
with col3:
    st.markdown('<div class="clear-btn">', unsafe_allow_html=True)
    clear = st.button("Clear", use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)

if clear:
    st.session_state.messages = []
    st.rerun()

if send and user_input.strip():
    st.session_state.messages.append({"role": "user", "content": user_input.strip()})

    agent = build_agent()
    config = {"configurable": {"thread_id": st.session_state.thread_id}}

    with st.spinner("Thinking..."):
        result = agent.invoke(
            {"messages": [{"role": "user", "content": user_input.strip()}]},
            config=config,
        )

    # Extract tools used
    tools_used = []
    for msg in result["messages"]:
        if isinstance(msg, AIMessage) and msg.tool_calls:
            for tc in msg.tool_calls:
                tools_used.append(tc["name"])

    reply = result["messages"][-1].content

    st.session_state.messages.append({
        "role": "assistant",
        "content": reply,
        "tools_used": tools_used,
    })

    st.rerun()