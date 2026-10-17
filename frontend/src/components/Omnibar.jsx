import React, { useState } from 'react';
import { MapPin, Sparkles, ArrowUp, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Omnibar({
  onSubmit,
  isLoading,
  isLiveMode,
  placeholder = "Type a city name or question (e.g., 'What is happening in Tokyo today?')..."
}) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSubmit(query.trim());
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Floating Omnibar Card */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.08)] transition-all flex items-center p-2 pl-4 gap-3 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100/50"
      >
        <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full bg-transparent border-none text-slate-900 placeholder:text-slate-400 text-sm md:text-base focus:outline-hidden disabled:opacity-50"
        />

        <div className="flex items-center gap-2 pr-1 shrink-0">
          <div className="text-slate-400 hover:text-blue-500 cursor-pointer p-1.5 transition-colors hidden sm:block" title="AI enhanced geocoding">
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              query.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </motion.form>

      {/* Microtext footer matching Stitch screenshot */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-3 font-medium">
        <div className="flex items-center gap-1.5">
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/80 font-mono text-[10px] text-slate-600">
            Enter ↵
          </kbd>
          <span>to submit</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">FastAPI endpoint ready:</span>
          <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
            POST /chat
          </span>
          <span className="text-[10px] text-slate-400">
            ({isLiveMode ? 'Live active' : 'Mock active'})
          </span>
        </div>
      </div>
    </div>
  );
}
