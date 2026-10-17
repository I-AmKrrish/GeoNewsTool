export const MOCK_CITIES = {
  tokyo: {
    reply: "Tokyo is enjoying pleasant, clear skies with temperatures around 18.5°C. Key municipal developments spotlight breakthroughs in autonomous public transit infrastructure and thriving springtime cultural tourism across central districts.",
    tools_used: ["get_weather", "get_news"],
    location: {
      city: "Tokyo",
      country: "Japan",
      lat: 35.6762,
      lon: 139.6503,
    },
    weather: {
      temp: 18.5,
      feels_like: 17.8,
      condition: "Clear Sky",
      humidity: 52,
      wind_speed: "3.6 m/s"
    },
    news: [
      {
        title: "Tokyo Tech Summit 2026 Unveils Autonomous Megacity Mobility Grid",
        snippet: "Metropolitan government partners with leading robotics labs in Odaiba to roll out autonomous electric rapid transit systems across central wards.",
        url: "https://www3.nhk.or.jp/nhkworld/en/news/",
        source: "NHK World",
        published: "2h ago"
      },
      {
        title: "Historic Cherry Blossom Season Draws Record Cultural Tourism to Ueno",
        snippet: "Parks throughout Tokyo report exceptional blooming conditions as international cultural exchanges peak across Shibuya and Ginza art districts.",
        url: "https://www.japantimes.co.jp/",
        source: "The Japan Times",
        published: "5h ago"
      },
      {
        title: "Green Energy Transition: Solar Architecture Mandates Take Effect",
        snippet: "New commercial complexes across Shinjuku achieve net-zero power ratings under Tokyo's accelerated climate resilience guidelines.",
        url: "https://asia.nikkei.com/",
        source: "Nikkei Asia",
        published: "8h ago"
      }
    ]
  },
  bengaluru: {
    reply: "Bengaluru is experiencing warm, partly cloudy conditions at 27.2°C. The silicon hub is buzzing with new generative AI enterprise expansions and record-breaking public transit connectivity.",
    tools_used: ["get_weather", "get_news"],
    location: {
      city: "Bengaluru",
      country: "India",
      lat: 12.9716,
      lon: 77.5946,
    },
    weather: {
      temp: 27.2,
      feels_like: 28.1,
      condition: "Partly Cloudy",
      humidity: 61,
      wind_speed: "2.8 m/s"
    },
    news: [
      {
        title: "Bengaluru Innovation Corridor Attracts Global DeepTech Hubs",
        snippet: "Over 40 multinational AI engineering centres open in Whitefield and Electronic City, cementing the city's lead in generative computation.",
        url: "https://www.deccanherald.com/",
        source: "Deccan Herald",
        published: "1h ago"
      },
      {
        title: "Namma Metro Purple Line Expansion Reaches Record Daily Ridership",
        snippet: "Urban transit officials announce extended late-night operational hours following 850,000 passenger milestones along tech park routes.",
        url: "https://timesofindia.indiatimes.com/",
        source: "The Times of India",
        published: "4h ago"
      }
    ]
  },
  london: {
    reply: "London is under atmospheric light drizzle at 14.1°C with gentle westerly breezes. Financial and technology sectors are focused on new green fintech frameworks and major South Bank cultural retrospectives.",
    tools_used: ["get_weather", "get_news"],
    location: {
      city: "London",
      country: "United Kingdom",
      lat: 51.5074,
      lon: -0.1278,
    },
    weather: {
      temp: 14.1,
      feels_like: 13.0,
      condition: "Light Rain & Mist",
      humidity: 78,
      wind_speed: "4.5 m/s"
    },
    news: [
      {
        title: "London Tech Week Kicks Off with Major Green FinTech Alliances",
        snippet: "Bank of England and King's Cross tech leaders launch collaborative sustainable finance verification frameworks for European markets.",
        url: "https://www.bbc.co.uk/news",
        source: "BBC News",
        published: "3h ago"
      },
      {
        title: "Tate Modern Unveils Immersive Digital Geographies Exhibition",
        snippet: "South Bank welcomes international contemporary artists exploring satellite telemetry, spatial computing, and ecological mapping.",
        url: "https://www.theguardian.com/",
        source: "The Guardian",
        published: "6h ago"
      }
    ]
  },
  "san francisco": {
    reply: "San Francisco is clear and mild at 16.8°C with typical coastal ocean air. Headlines center on groundbreaking AI research initiatives in Mission Bay and new zero-emission transit along the Bay.",
    tools_used: ["get_weather", "get_news"],
    location: {
      city: "San Francisco",
      country: "United States",
      lat: 37.7749,
      lon: -122.4194,
    },
    weather: {
      temp: 16.8,
      feels_like: 16.0,
      condition: "Sunny & Mild",
      humidity: 64,
      wind_speed: "4.1 m/s"
    },
    news: [
      {
        title: "Bay Area Quantum & AI Symposium Sets New Open Weights Benchmarks",
        snippet: "Mission Bay research institutes unveil decentralized inference networks aimed at accelerating biomedical discoveries and climate modeling.",
        url: "https://www.sfchronicle.com/",
        source: "SF Chronicle",
        published: "2h ago"
      }
    ]
  }
};

/**
 * Handle non-city or general chat in mock mode without fake coordinates
 */
export function handleMockGeneralChat(query) {
  const q = query.trim().toLowerCase();
  
  if (q.includes("hi") || q.includes("hello") || q.includes("hey") || q.includes("how are you") || q.includes("who are you")) {
    return {
      reply: "Hello! 👋 I'm **GeoNewsTool**, your city intelligence assistant. You can ask me for the latest weather conditions, coordinates, or verified news for any city worldwide (e.g., *Tokyo*, *Bengaluru*, *London*, or *San Francisco*).",
      tools_used: [],
      location: null,
      weather: null,
      news: null,
      source: "mock"
    };
  }

  // If not matching any known city, return a conversational guidance reply
  return {
    reply: `I don't have recorded telemetry for "${query}". Try asking about cities like **Tokyo**, **Bengaluru**, **London**, or **San Francisco**, or start your FastAPI backend to query any location live!`,
    tools_used: [],
    location: null,
    weather: null,
    news: null,
    source: "mock"
  };
}
