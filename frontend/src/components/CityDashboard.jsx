import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  ExternalLink, 
  Sparkles, 
  ArrowLeft, 
  Newspaper, 
  Navigation,
  Globe2,
  Bot,
  MapPin
} from 'lucide-react';
import InteractiveGlobe from './InteractiveGlobe';

function getWeatherIcon(condition = "") {
  const c = condition.toLowerCase();
  if (c.includes("rain") || c.includes("drizzle")) return <CloudRain className="w-8 h-8 text-blue-500" />;
  if (c.includes("cloud")) return <Cloud className="w-8 h-8 text-slate-500" />;
  if (c.includes("wind") || c.includes("breeze")) return <Wind className="w-8 h-8 text-teal-500" />;
  return <Sun className="w-8 h-8 text-amber-500" />;
}

export default function CityDashboard({ data, userQuery, onBack }) {
  if (!data) return null;

  const { reply, location, weather, news, tools_used = [] } = data;

  const hasTools = tools_used && tools_used.length > 0;
  const hasLocation = Boolean(location && location.city);
  const hasWeather = Boolean(weather && typeof weather.temp === 'number');
  const hasNews = Boolean(Array.isArray(news) && news.length > 0);

  // If no tools were used or all telemetry fields are null -> ONLY render a normal chat bubble
  if (!hasLocation && !hasWeather && !hasNews) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl mx-auto space-y-4"
      >
        <div className="flex items-center justify-between pb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 bg-white/80 hover:bg-white border border-slate-200/80 px-3 py-1.5 rounded-full shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>New Search</span>
          </button>
        </div>

        {/* User Query Bubble */}
        {userQuery && (
          <div className="flex justify-end">
            <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-tr-xs px-4 py-3 text-sm shadow-xs leading-relaxed">
              {userQuery}
            </div>
          </div>
        )}

        {/* Assistant Reply Bubble */}
        <div className="flex items-start gap-3 justify-start">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/70">
            <Bot className="w-4 h-4" />
          </div>
          <div className="max-w-[85%] bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xs text-sm text-slate-800 leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
              }}
            >
              {reply || "Hello! How can I assist you with city weather or news today?"}
            </ReactMarkdown>
          </div>
        </div>
      </motion.div>
    );
  }

  // Otherwise, render reports strictly matching available real data
  const hasCoordinates = hasLocation && typeof location.lat === 'number' && typeof location.lon === 'number';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Action / Reset Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white/80 hover:bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Explore Another City</span>
        </button>

        {hasLocation && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Target: <strong className="text-slate-800">{location.city}</strong></span>
          </div>
        )}
      </div>

      {/* 3D Globe with 📍 pin: ONLY rendered when location != null and has coordinates */}
      {hasLocation && hasCoordinates && (
        <div className="flex flex-col items-center justify-center pt-2">
          <InteractiveGlobe
            size={180}
            targetLat={location.lat}
            targetLon={location.lon}
            isTargetActive={true}
          />
        </div>
      )}

      {/* City Header: ONLY rendered when location != null */}
      {hasLocation && (
        <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {location.country && (
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                <Globe2 className="w-3.5 h-3.5" />
                <span>{location.country}</span>
              </div>
            )}
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              {location.city}
            </h2>
          </div>

          {hasCoordinates && (
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/70 px-4 py-2 rounded-xl text-xs font-mono text-slate-600">
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>LAT {location.lat.toFixed(4)}°</span>
              <span className="text-slate-300">|</span>
              <span>LON {location.lon.toFixed(4)}°</span>
            </div>
          )}
        </div>
      )}

      {/* Weather & Briefing Grid */}
      <div className={`grid grid-cols-1 ${hasWeather ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-6`}>
        {/* Weather Card: ONLY rendered when weather != null */}
        {hasWeather && (
          <div className="md:col-span-1 bg-gradient-to-b from-white to-sky-50/50 backdrop-blur-md rounded-2xl p-5 border border-sky-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Current Atmosphere
                </span>
                {getWeatherIcon(weather.condition)}
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-black text-slate-900">
                  {Math.round(weather.temp)}°
                </span>
                <span className="text-sm font-semibold text-slate-500">C</span>
              </div>

              <p className="text-sm font-medium text-slate-700 capitalize mb-4">
                {weather.condition}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200/60 text-xs">
              {typeof weather.feels_like === 'number' && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                  <span>Feels {Math.round(weather.feels_like)}°C</span>
                </div>
              )}
              {typeof weather.humidity === 'number' && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span>Humidity {weather.humidity}%</span>
                </div>
              )}
              {weather.wind_speed && (
                <div className="col-span-2 flex items-center gap-1.5 text-slate-600">
                  <Wind className="w-3.5 h-3.5 text-teal-500" />
                  <span>Wind {weather.wind_speed}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Briefing / Reply: ALWAYS rendered as markdown */}
        {reply && (
          <div className={`${hasWeather ? 'md:col-span-2' : 'md:col-span-1'} bg-white/85 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between`}>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Executive Intelligence Briefing
                </h3>
              </div>
              
              <div className="text-slate-700 text-sm md:text-base leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li>{children}</li>,
                  }}
                >
                  {reply}
                </ReactMarkdown>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Verified Agent Telemetry</span>
              <span>Updated Live</span>
            </div>
          </div>
        )}
      </div>

      {/* Headline Cards: ONLY rendered when news != null and length > 0 */}
      {hasNews && (
        <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Latest Verified Headlines
              </h3>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {news.length} {news.length === 1 ? 'source' : 'sources'} cited
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.map((item, idx) => (
              <motion.a
                key={idx}
                href={item.url || "#"}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -3 }}
                className="group p-4 rounded-xl border border-slate-200/70 hover:border-blue-300 bg-slate-50/60 hover:bg-white transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
                    <span className="text-blue-600 font-medium">{item.source || "News Source"}</span>
                    <span>{item.published || "Recent"}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {item.title}
                  </h4>
                  {item.snippet && (
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                      {item.snippet}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform mt-2">
                  <span>Read Article</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
