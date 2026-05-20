import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Sparkles, Calendar, TrendingUp, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';

const MOOD_COLORS = {
  Calm: 'bg-emerald-400 dark:bg-emerald-500',
  Tired: 'bg-slate-400 dark:bg-slate-500',
  Anxious: 'bg-amber-400 dark:bg-amber-500',
  Low: 'bg-indigo-400 dark:bg-indigo-500',
  Unsafe: 'bg-rose-450 dark:bg-rose-500'
};

const SUGGESTIONS = [
  "Try drawing or coloring without any goal in mind — let your feelings guide the pencil.",
  "Consider closing your eyes for 5 minutes and listening to the soft ambient sound around you.",
  "You don't have to carry this alone. Would you feel comfortable sharing what's on your mind with Sol?",
  "Take a warm shower or cuddle up in a cozy blanket and allow yourself to just rest.",
  "Try doing a 3-minute muscle relaxation exercise: tensing and releasing muscle groups one by one."
];

export const MoodHistory = () => {
  const { moods } = useAppData();

  // 1. Grid Calendar generation (last 28 days)
  const getGridDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = moods.find(m => m.date === dateStr);
      days.push({
        dateStr,
        dayNum: d.getDate(),
        entry
      });
    }
    return days;
  };

  const gridDays = getGridDays();

  // 2. Trend Line data (chronological)
  // Recharts requires [{name: 'Date', score: 3}]
  const chartData = [...moods]
    .reverse() // Make chronological
    .slice(-10) // Show last 10 entries max
    .map(m => ({
      date: new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: m.score || m.moodScore || 3,
      mood: m.moodEmoji
    }));

  // 3. Consecutive low mood check (last 3 days)
  // Low mood includes 'Low', 'Anxious', 'Unsafe' (score <= 3)
  const checkConsecutiveLowMood = () => {
    if (moods.length < 3) return false;
    // Sort reverse chronological
    const sortedEntries = [...moods].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Check if the most recent 3 entries are all low/anxious/unsafe
    const recent3 = sortedEntries.slice(0, 3);
    const allLow = recent3.every(e => ['Low', 'Anxious', 'Unsafe'].includes(e.moodEmoji));
    return allLow;
  };

  const hasConsecutiveLow = checkConsecutiveLowMood();

  // Custom tool-tip for mood chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div class="bg-white dark:bg-stone-900 p-3 rounded-xl shadow-md border border-stone-100 dark:border-stone-850 text-xs">
          <p class="font-bold dark:text-white">{data.date}</p>
          <p class="text-brand-lavender mt-1">Mood: <span class="font-semibold">{data.mood}</span></p>
          <p class="text-stone-400">Score: {data.score}/5</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div class="space-y-6 max-w-xl mx-auto">
      {/* Nudge Card for Tough Days */}
      {hasConsecutiveLow && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          class="bg-brand-lavender/10 border border-brand-lavender/35 p-6 rounded-3xl flex items-start gap-4"
        >
          <div class="p-3 bg-brand-lavender/25 text-brand-lavender rounded-2xl">
            <HeartHandshake class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-serif font-bold text-brand-charcoal dark:text-white text-base">A Gentle Nudge</h4>
            <p class="text-sm text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
              We noticed you've had a tough few days. Here's something that might help: 
              <span class="font-medium text-stone-800 dark:text-white block mt-1.5 bg-white/60 dark:bg-brand-slate/40 p-3 rounded-2xl border border-brand-lavender/10">
                "{SUGGESTIONS[moods.length % SUGGESTIONS.length]}"
              </span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Grid Calendar */}
      <div class="bg-white dark:bg-brand-slate p-6 rounded-3xl shadow-glass border border-white/40 dark:border-white/5">
        <div class="flex items-center gap-2 mb-4">
          <Calendar class="w-4 h-4 text-brand-lavender" />
          <h3 class="text-xs font-semibold tracking-wider text-brand-lavender uppercase">Mood Calendar (28 Days)</h3>
        </div>

        <div class="grid grid-cols-7 gap-2">
          {gridDays.map((day, idx) => {
            const hasMood = !!day.entry;
            const moodColor = hasMood ? MOOD_COLORS[day.entry.moodEmoji] : 'bg-stone-50 dark:bg-stone-900/40';
            return (
              <div
                key={idx}
                title={hasMood ? `${day.dateStr}: ${day.entry.moodEmoji}` : `${day.dateStr}: No Entry`}
                class={`aspect-square rounded-xl flex items-center justify-center text-xs font-semibold relative transition-all duration-300 border ${
                  hasMood 
                    ? `${moodColor} text-white border-transparent shadow-sm scale-[1.02] hover:scale-105` 
                    : 'text-stone-400 dark:text-stone-600 border-stone-100 dark:border-stone-850 hover:bg-stone-100 dark:hover:bg-stone-800/40'
                }`}
              >
                {day.dayNum}
                {hasMood && (
                  <span class="absolute bottom-0.5 right-0.5 text-[8px] opacity-80 select-none">
                    {day.entry.moodEmoji === 'Calm' && '😌'}
                    {day.entry.moodEmoji === 'Tired' && '🥱'}
                    {day.entry.moodEmoji === 'Anxious' && '😰'}
                    {day.entry.moodEmoji === 'Low' && '😔'}
                    {day.entry.moodEmoji === 'Unsafe' && '⚠️'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div class="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-stone-100 dark:border-stone-850 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded bg-emerald-400" /> Calm
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded bg-slate-400" /> Tired
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded bg-amber-400" /> Anxious
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded bg-indigo-400" /> Low
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded bg-rose-450" /> Unsafe
          </div>
        </div>
      </div>

      {/* Mood Trend Line Chart */}
      <div class="bg-white dark:bg-brand-slate p-6 rounded-3xl shadow-glass border border-white/40 dark:border-white/5">
        <div class="flex items-center gap-2 mb-4">
          <TrendingUp class="w-4 h-4 text-brand-lavender" />
          <h3 class="text-xs font-semibold tracking-wider text-brand-lavender uppercase">Mood Trend</h3>
        </div>

        {moods.length < 7 ? (
          <div class="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-stone-100 dark:border-stone-850 rounded-2xl bg-stone-50/20 dark:bg-stone-900/10">
            <Sparkles class="w-6 h-6 text-brand-lavender opacity-40 mb-2" />
            <h4 class="font-bold text-stone-600 dark:text-stone-450 text-sm">Need {7 - moods.length} more check-ins</h4>
            <p class="text-xs text-stone-450 mt-1">
              Complete {7 - moods.length} more daily check-ins to generate your mood trend visual chart.
            </p>
          </div>
        ) : (
          <div class="w-full h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" class="dark:stroke-stone-800" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: '#888888' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  domain={[1, 5]} 
                  ticks={[1, 2, 3, 4, 5]}
                  tickFormatter={(val) => {
                    if (val === 5) return '😌';
                    if (val === 4) return '🥱';
                    if (val === 3) return '😰';
                    if (val === 2) return '😔';
                    if (val === 1) return '⚠️';
                    return '';
                  }}
                  tick={{ fontSize: 14 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#a78bfa" 
                  strokeWidth={3} 
                  dot={{ r: 4, stroke: '#a78bfa', strokeWidth: 2, fill: '#fff' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
