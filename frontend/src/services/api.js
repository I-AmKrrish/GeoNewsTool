import { MOCK_CITIES, handleMockGeneralChat } from './mockData';

const DEFAULT_BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Clean API Layer for GeoNewsTool
 * Calls POST /chat and strictly passes through backend data with NO placeholder fallbacks.
 */
export async function fetchCityIntelligence(query, { useMock = false, backendUrl = DEFAULT_BACKEND_URL } = {}) {
  const normalized = query.trim();
  const lower = normalized.toLowerCase();

  // If live mode requested, attempt POST /chat
  if (!useMock) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: normalized }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return {
          ...normalizeBackendResponse(data),
          source: 'live',
        };
      }
    } catch (err) {
      console.warn('Backend /chat unavailable or timed out. Falling back to mock data:', err.message);
    }
  }

  // Fallback or explicit Mock Mode
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Check known mock cities
  for (const [key, cityData] of Object.entries(MOCK_CITIES)) {
    if (lower.includes(key) || key.includes(lower)) {
      return {
        ...cityData,
        source: 'mock',
      };
    }
  }

  // Handle general conversational chats in mock mode with NO fake cards/coordinates
  return handleMockGeneralChat(normalized);
}

/**
 * Strictly preserves null values for absent fields.
 * Never injects default city, coordinates, temperature, or headlines.
 */
function normalizeBackendResponse(raw) {
  const location = raw.location && raw.location.city ? {
    city: String(raw.location.city),
    country: raw.location.country ? String(raw.location.country) : null,
    lat: typeof raw.location.lat === 'number' ? raw.location.lat : null,
    lon: typeof raw.location.lon === 'number' ? raw.location.lon : null,
  } : null;

  const weather = raw.weather && typeof raw.weather.temp === 'number' ? {
    temp: raw.weather.temp,
    feels_like: typeof raw.weather.feels_like === 'number' ? raw.weather.feels_like : null,
    condition: raw.weather.condition || "Weather update",
    humidity: typeof raw.weather.humidity === 'number' ? raw.weather.humidity : null,
    wind_speed: raw.weather.wind_speed || null,
  } : null;

  const news = Array.isArray(raw.news) && raw.news.length > 0 ? raw.news.map((item) => ({
    title: item.title || "Untitled",
    snippet: item.snippet || "",
    url: item.url || "#",
    source: item.source || "News Source",
    published: item.published || "Recent",
  })) : null;

  return {
    reply: raw.reply || raw.summary || "",
    tools_used: Array.isArray(raw.tools_used) ? raw.tools_used : [],
    location,
    weather,
    news,
  };
}

/**
 * Health check helper for backend status indicator
 */
export async function checkBackendStatus(backendUrl = DEFAULT_BACKEND_URL) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${backendUrl}/health`, { method: 'GET', signal: controller.signal });
    clearTimeout(id);
    return res.ok;
  } catch {
    return false;
  }
}
