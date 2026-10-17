import React from 'react';
import { Compass, Server, CheckCircle2, RefreshCw } from 'lucide-react';

export default function Header({
  isLiveMode,
  setIsLiveMode,
  backendOnline,
  onReset
}) {
  return (
    <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-200/60 bg-white/50 backdrop-blur-md sticky top-0 z-40 transition-colors">
      {/* Brand */}
      <div 
        onClick={onReset}
        className="flex items-center gap-3 cursor-pointer group select-none"
      >
        <div className="w-9 h-9 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-105 shadow-xs">
          <Compass className="w-5 h-5 text-blue-600 animate-spin-slow" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            GeoNews<span className="font-semibold text-slate-600">Tool</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60">
            AI Assistant
          </span>
        </div>
      </div>

      {/* Right controls: Live Geocoding pill & Backend toggle */}
      <div className="flex items-center gap-3">
        {/* Live Geocoding Badge matching Stitch screenshot */}
        <div className="flex items-center gap-2 bg-white/90 border border-slate-200/80 px-3 py-1.5 rounded-full shadow-xs text-xs font-medium text-slate-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Geocoding</span>
        </div>

        {/* Backend mode switcher */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-full border border-slate-200/80 text-xs">
          <button
            onClick={() => setIsLiveMode(false)}
            className={`px-2.5 py-1 rounded-full font-medium transition-all ${
              !isLiveMode
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Mock Data
          </button>
          <button
            onClick={() => setIsLiveMode(true)}
            className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 transition-all ${
              isLiveMode
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-3 h-3" />
            <span>FastAPI Live</span>
            {backendOnline && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
