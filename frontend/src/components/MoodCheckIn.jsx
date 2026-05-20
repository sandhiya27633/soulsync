import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { motion, AnimatePresence } from 'framer-motion';

const MOODS_CONFIG = [
  { label: 'Calm', emoji: '😌', score: 5, bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-600 dark:text-emerald-400', hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/40' },
  { label: 'Tired', emoji: '🥱', score: 4, bg: 'bg-slate-50 dark:bg-slate-950/20', border: 'border-slate-200 dark:border-slate-800', text: 'text-slate-600 dark:text-slate-400', hover: 'hover:bg-slate-100 dark:hover:bg-slate-900/40' },
  { label: 'Anxious', emoji: '😰', score: 3, bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400', hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/40' },
  { label: 'Low', emoji: '😔', score: 2, bg: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-600 dark:text-indigo-400', hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/40' },
  { label: 'Unsafe', emoji: '⚠️', score: 1, bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-600 dark:text-rose-400', hover: 'hover:bg-rose-100 dark:hover:bg-rose-900/40' }
];

export const MoodCheckIn = () => {
  const { moods, logMood, todayDateStr } = useAppData();
  const [selectedMood, setSelectedMood] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user already logged mood today
  const todayEntry = moods.find(m => m.date === todayDateStr);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood) return;
    setIsSubmitting(true);
    await logMood(selectedMood.label, selectedMood.score, notes);
    setIsSubmitting(false);
    setSelectedMood(null);
    setNotes('');
  };

  return (
    <div class="bg-white dark:bg-brand-slate p-6 rounded-3xl shadow-glass border border-white/40 dark:border-white/5 max-w-md mx-auto">
      <h3 class="text-sm font-semibold tracking-wider text-brand-lavender uppercase mb-2">Daily Check-in</h3>
      
      {todayEntry ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          class="text-center py-6"
        >
          <div class="text-5xl mb-3">
            {MOODS_CONFIG.find(m => m.label === todayEntry.moodEmoji)?.emoji || '🌱'}
          </div>
          <p class="font-semibold text-lg dark:text-white">
            You logged <span class="text-brand-lavender font-bold">{todayEntry.moodEmoji}</span> today
          </p>
          <p class="text-xs text-stone-400 dark:text-stone-500 mt-1">
            "Your emotions are like waves, they come and go. Good job checking in."
          </p>
          {todayEntry.notes && (
            <div class="mt-4 px-4 py-2 bg-stone-50 dark:bg-stone-900/40 rounded-xl text-sm italic text-stone-600 dark:text-stone-300 border border-stone-100 dark:border-stone-800">
              "{todayEntry.notes}"
            </div>
          )}
        </motion.div>
      ) : (
        <div>
          <h4 class="text-xl font-bold font-serif dark:text-white mb-4">How are you feeling right now?</h4>
          
          <div class="grid grid-cols-5 gap-2 mb-6">
            {MOODS_CONFIG.map((mood) => {
              const isSelected = selectedMood?.label === mood.label;
              return (
                <button
                  key={mood.label}
                  type="button"
                  onClick={() => setSelectedMood(mood)}
                  class={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 ${mood.hover} ${
                    isSelected 
                      ? `${mood.bg} ${mood.border} scale-105 shadow-md` 
                      : 'border-transparent bg-stone-50 dark:bg-stone-900/20'
                  }`}
                >
                  <span class="text-3xl mb-1 filter drop-shadow-sm select-none">{mood.emoji}</span>
                  <span class={`text-[10px] font-bold tracking-wide ${isSelected ? mood.text : 'text-stone-400 dark:text-stone-500'}`}>
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedMood && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit}
                class="overflow-hidden space-y-4"
              >
                <div>
                  <label htmlFor="notes" class="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5">
                    Any notes about today? (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Reflect on your thoughts, triggers, or moments of peace..."
                    class="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 focus:border-brand-lavender dark:focus:border-brand-lavender rounded-2xl text-sm focus:outline-none resize-none h-20 transition-all dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  class="w-full py-3 bg-brand-lavender text-white rounded-2xl font-semibold shadow-md hover:shadow-lg hover:bg-brand-accent transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Complete Check-In'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
