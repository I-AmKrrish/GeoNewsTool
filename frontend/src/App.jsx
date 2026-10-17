import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  CloudSun, 
  Newspaper, 
  ArrowUpRight, 
  AlertCircle
} from 'lucide-react';
import Header from './components/Header';
import InteractiveGlobe from './components/InteractiveGlobe';
import Omnibar from './components/Omnibar';
import CityDashboard from './components/CityDashboard';
import { fetchCityIntelligence, checkBackendStatus } from './services/api';

const QUICK_CITIES = [
  { label: "Tokyo today", flag: "🇯🇵", query: "Tokyo" },
  { label: "Bengaluru briefing", flag: "🇮🇳", query: "Bengaluru" },
  { label: "London report", flag: "🇬🇧", query: "London" },
  { label: "San Francisco", flag: "🇺🇸", query: "San Francisco" },
];

export default function App() {
  const [selectedCityData, setSelectedCityData] = useState(null);
  const [activeQuery, setActiveQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true); // Default to live FastAPI backend
  const [backendOnline, setBackendOnline] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Check backend health periodically
  useEffect(() => {
    let mounted = true;
    const verifyHealth = async () => {
      const online = await checkBackendStatus();
      if (mounted) setBackendOnline(online);
    };
    verifyHealth();
    const interval = setInterval(verifyHealth, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSearch = async (query) => {
    setIsLoading(true);
    setErrorMessage(null);
    setActiveQuery(query);
    try {
      const data = await fetchCityIntelligence(query, { useMock: !isLiveMode });
      setSelectedCityData(data);
    } catch (err) {
      console.error(err);
      setErrorMessage("Could not process your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedCityData(null);
    setActiveQuery('');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/40 via-white to-slate-50 flex flex-col justify-between text-slate-900 relative selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Decorative ambient background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-blue-100/30 via-sky-50/20 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <Header
        isLiveMode={isLiveMode}
        setIsLiveMode={setIsLiveMode}
        backendOnline={backendOnline}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!selectedCityData ? (
            /* Stitch Default / Exploration View */
            <motion.div
              key="hero-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="w-full flex flex-col items-center text-center space-y-7 my-auto py-4"
            >
              {/* Interactive 3D Cobe Globe */}
              <InteractiveGlobe 
                size={230} 
                isTargetActive={false}
              />

              {/* Title & Subtitle */}
              <div className="max-w-2xl space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Which city shall we explore?
                </h1>
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                  Ask for any metropolis, town, or question. GeoNewsTool aggregates real-time weather, satellite coordinates, and the latest verified headlines.
                </p>
              </div>

              {/* Suggestion Chips from Stitch screenshot */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl">
                {QUICK_CITIES.map((item, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSearch(item.query)}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-white/95 hover:bg-blue-50/60 border border-slate-200/90 hover:border-blue-300 text-slate-700 hover:text-blue-700 px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{item.flag}</span>
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </motion.button>
                ))}
              </div>

              {/* Feature Indicators from Stitch screenshot */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 pt-3">
                <div className="flex items-center gap-1.5 font-medium">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Fast Geocoding</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CloudSun className="w-4 h-4 text-sky-500" />
                  <span>Realtime Atmosphere</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Newspaper className="w-4 h-4 text-indigo-500" />
                  <span>Multi-source Headlines</span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Results or Chat View */
            <CityDashboard
              key="result-dashboard"
              data={selectedCityData}
              userQuery={activeQuery}
              onBack={handleReset}
            />
          )}
        </AnimatePresence>

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}
      </main>

      {/* Floating Omnibar at bottom */}
      <footer className="w-full pb-6 pt-2 sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent backdrop-blur-xs z-30">
        <Omnibar
          onSubmit={handleSearch}
          isLoading={isLoading}
          isLiveMode={isLiveMode}
        />
      </footer>
    </div>
  );
}
