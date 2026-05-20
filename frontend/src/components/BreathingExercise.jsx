import React, { useState, useEffect } from 'react';
import { Wind, Play, Square, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('Ready'); // 'Inhale', 'Hold', 'Exhale', 'Ready'
  const [secondsLeft, setSecondsLeft] = useState(4);

  useEffect(() => {
    let timer = null;
    if (isActive) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Move to next phase in 4-4-4 cycle
            if (phase === 'Ready' || phase === 'Exhale') {
              setPhase('Inhale');
              return 4;
            } else if (phase === 'Inhale') {
              setPhase('Hold');
              return 4;
            } else if (phase === 'Hold') {
              setPhase('Exhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setPhase('Ready');
      setSecondsLeft(0);
    }

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const handleToggle = () => {
    if (isActive) {
      setIsActive(false);
    } else {
      setIsActive(true);
      setPhase('Inhale');
      setSecondsLeft(4);
    }
  };

  return (
    <div class="glass-panel rounded-3xl p-6 hover-card relative overflow-hidden flex flex-col items-center">
      <div class="w-full flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <Wind class="w-4 h-4 text-brand-mint" />
          <h3 class="text-xs font-semibold tracking-wider text-brand-mint uppercase">Mindful Respite</h3>
        </div>
        {isActive && (
          <span class="text-[9px] font-bold bg-brand-mint/10 text-brand-mint px-2 py-0.5 rounded-full uppercase animate-pulse">
            Session Active
          </span>
        )}
      </div>

      <h4 class="text-base font-bold font-serif dark:text-white mb-1 text-center">4-4-4 Box Breathing</h4>
      <p class="text-[11px] text-stone-400 dark:text-stone-500 mb-6 text-center max-w-[240px]">
        Regulate your nervous system, lower anxiety, and find immediate focus.
      </p>

      {/* Breathing animation container */}
      <div class="h-36 flex items-center justify-center relative mb-6 w-full">
        {/* Animated breathing circle */}
        <div 
          style={{ transition: 'all 4s ease-in-out' }}
          class={`absolute rounded-full flex items-center justify-center border transition-all duration-1000 ${
            phase === 'Inhale' 
              ? 'w-32 h-32 bg-brand-mint/20 border-brand-mint/40 scale-110 shadow-lg shadow-brand-mint/10' 
              : phase === 'Hold'
              ? 'w-32 h-32 bg-brand-lavender/25 border-brand-lavender/40 scale-110 shadow-lg shadow-brand-lavender/10'
              : phase === 'Exhale'
              ? 'w-20 h-20 bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-800 scale-95'
              : 'w-24 h-24 bg-stone-50 dark:bg-stone-900 border-stone-250 dark:border-stone-850'
          }`}
        >
          {/* Inner circle */}
          <div class={`w-16 h-16 rounded-full bg-white dark:bg-brand-slate flex flex-col items-center justify-center shadow-inner transition-colors duration-500`}>
            <span class="text-xs font-bold dark:text-white leading-none">
              {isActive ? secondsLeft : 'Ready'}
            </span>
            {isActive && <span class="text-[8px] font-bold text-stone-400 uppercase tracking-wider mt-0.5">sec</span>}
          </div>
        </div>
      </div>

      {/* Action phase instructions */}
      <div class="h-10 text-center mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            class="text-sm font-bold tracking-wide"
          >
            {phase === 'Ready' && <span class="text-stone-400">Click Play to begin</span>}
            {phase === 'Inhale' && <span class="text-brand-mint">💨 Inhale slowly...</span>}
            {phase === 'Hold' && <span class="text-brand-lavender">🧘 Hold your breath...</span>}
            {phase === 'Exhale' && <span class="text-stone-500 dark:text-stone-300">🌬️ Exhale gently...</span>}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Interactive Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        class={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all duration-300 ${
          isActive 
            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20' 
            : 'bg-brand-mint text-stone-800 hover:bg-emerald-300'
        }`}
      >
        {isActive ? (
          <>
            <Square class="w-3.5 h-3.5 fill-current" /> Stop Exercise
          </>
        ) : (
          <>
            <Play class="w-3.5 h-3.5 fill-current" /> Start Respite
          </>
        )}
      </button>
    </div>
  );
};
