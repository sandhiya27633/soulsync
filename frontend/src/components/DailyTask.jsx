import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

export const DailyTask = () => {
  const { dailyTask, completeDailyTask } = useAppData();

  if (!dailyTask) return null;

  return (
    <div class="bg-white dark:bg-brand-slate p-6 rounded-3xl shadow-glass border border-white/40 dark:border-white/5 max-w-sm mx-auto overflow-hidden relative">
      <div class="absolute -right-6 -top-6 w-20 h-20 bg-brand-mint/10 rounded-full blur-xl pointer-events-none" />
      <div class="absolute -left-6 -bottom-6 w-20 h-20 bg-brand-lavender/10 rounded-full blur-xl pointer-events-none" />

      <div class="relative z-10">
        <h3 class="text-xs font-semibold tracking-wider text-brand-lavender uppercase mb-2">Today's Self-Care Goal</h3>
        
        <h4 class="text-lg font-bold font-serif dark:text-white mb-4">
          Nourish Your Well-being
        </h4>

        <div class="bg-stone-50 dark:bg-stone-900/30 border border-stone-100 dark:border-stone-850 p-4 rounded-2xl flex items-start gap-4 mb-4">
          <button 
            type="button" 
            onClick={completeDailyTask}
            disabled={dailyTask.completed}
            class="mt-1 transition-transform active:scale-95 duration-200 focus:outline-none"
          >
            {dailyTask.completed ? (
              <CheckCircle2 class="w-6 h-6 text-brand-mint fill-brand-mint/10" />
            ) : (
              <Circle class="w-6 h-6 text-stone-300 dark:text-stone-700 hover:text-brand-lavender transition-colors" />
            )}
          </button>

          <div class="flex-1">
            <p class={`text-sm leading-relaxed ${dailyTask.completed ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-700 dark:text-stone-200'}`}>
              {dailyTask.taskText}
            </p>
            {dailyTask.completed ? (
              <span class="inline-block mt-2 text-[10px] font-bold text-brand-mint uppercase tracking-wider bg-brand-mint/10 px-2 py-0.5 rounded-full">
                Completed • +50 XP
              </span>
            ) : (
              <span class="inline-block mt-2 text-[10px] font-bold text-brand-lavender uppercase tracking-wider bg-brand-lavender/10 px-2 py-0.5 rounded-full">
                Goal • 50 XP
              </span>
            )}
          </div>
        </div>

        {!dailyTask.completed && (
          <button
            type="button"
            onClick={completeDailyTask}
            class="w-full py-3 bg-brand-mint text-stone-800 rounded-2xl font-bold shadow-sm hover:shadow-md hover:bg-emerald-300 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>Complete Task</span>
          </button>
        )}

        {dailyTask.completed && (
          <div class="text-center py-2 text-xs font-semibold text-brand-mint">
            ✨ You helped Sol grow today. Keep it up!
          </div>
        )}
      </div>
    </div>
  );
};
