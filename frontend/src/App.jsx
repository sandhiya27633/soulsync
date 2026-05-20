import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import { Navbar } from './components/Navbar';
import { Onboarding } from './components/Onboarding';
import { Companion } from './components/Companion';
import { MoodCheckIn } from './components/MoodCheckIn';
import { DailyTask } from './components/DailyTask';
import { MoodHistory } from './components/MoodHistory';
import { SafetyCircle } from './components/SafetyCircle';
import { CrisisBar } from './components/CrisisBar';
import { AIListener } from './components/AIListener';
import { BreathingExercise } from './components/BreathingExercise';
import { Award, Flame, Zap, Shield, Sparkles, LayoutDashboard, MessageSquare, History, Heart, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const BADGE_META = {
  "First Journal": { icon: "📝", desc: "Logged your first daily check-in" },
  "3-day streak": { icon: "🔥", desc: "Checked in for 3 consecutive days" },
  "First Connection": { icon: "🔗", desc: "Added your first trusted contact" },
  "Reached out for help": { icon: "🤝", desc: "Used your Safety Circle for support" },
  "XP Master": { icon: "👑", desc: "Accumulated over 500 XP" }
};

const MainAppContent = () => {
  const { user } = useAuth();
  const { moods } = useAppData();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <Onboarding onComplete={() => setActiveTab('dashboard')} />;
  }

  // Generate dynamic time-of-day greeting
  const getGreeting = () => {
    const hrs = new Date().getHours();
    const name = user.displayName ? user.displayName.split(' ')[0] : 'Friend';
    if (hrs < 12) return `Good morning, ${name}`;
    if (hrs < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  return (
    <div class="pb-32 bg-[#FAF9F6] dark:bg-[#121110] min-h-screen transition-colors duration-500 relative overflow-hidden">
      
      {/* --- Ambient Moving Glow Blobs for Depth and Visual Splendor --- */}
      <div class="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-lavender/10 dark:bg-brand-lavender/5 filter blur-[120px] animate-blob-slow -z-10 pointer-events-none" />
      <div class="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-mint/10 dark:bg-brand-mint/5 filter blur-[150px] animate-blob-slower -z-10 pointer-events-none" />
      <div class="absolute top-[30%] right-[-20%] w-[40vw] h-[40vw] rounded-full bg-brand-accent/5 dark:bg-brand-accent/3 filter blur-[100px] animate-blob-slow -z-10 pointer-events-none" />

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main class="max-w-5xl mx-auto px-4 py-8 relative z-10">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div class="space-y-8">
            
            {/* Header Greeting */}
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  class="text-3xl md:text-4xl font-serif font-bold text-stone-800 dark:text-white flex items-center gap-2"
                >
                  {getGreeting()} <span class="animate-float select-none">✨</span>
                </motion.h1>
                <p class="text-stone-500 dark:text-stone-400 text-sm mt-1.5 font-medium">
                  How can we nourish your mind, body, and soul today?
                </p>
              </div>

              {/* Stats pillbox */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                class="flex items-center gap-4 bg-white/70 dark:bg-stone-900/60 backdrop-blur-md p-3.5 px-5 rounded-2xl shadow-glass border border-white/50 dark:border-white/5"
              >
                <div class="flex items-center gap-2">
                  <div class="p-2 bg-orange-500/10 rounded-xl">
                    <Flame class="w-5 h-5 text-orange-500 fill-orange-500/10" />
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase leading-none">Streak</span>
                    <span class="text-sm font-bold text-stone-800 dark:text-white mt-1">{user.streakDays || 0} Days</span>
                  </div>
                </div>
                
                <div class="w-px h-8 bg-stone-200 dark:bg-stone-800" />
                
                <div class="flex items-center gap-2">
                  <div class="p-2 bg-brand-lavender/10 rounded-xl">
                    <Zap class="w-5 h-5 text-brand-lavender fill-brand-lavender/10" />
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase leading-none">Experience</span>
                    <span class="text-sm font-bold text-stone-800 dark:text-white mt-1">{user.xp || 0} XP</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Grid Layout */}
            <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Companion & Guided Breathing */}
              <div class="md:col-span-4 space-y-6">
                <Companion streakDays={user.streakDays || 0} />
                <BreathingExercise />
              </div>

              {/* Right Column: Mood Check-in & Tasks / Badges */}
              <div class="md:col-span-8 space-y-6">
                
                {/* 1. Daily Check-in Card */}
                <MoodCheckIn />

                {/* 2. Today's Daily Self-Care Goal */}
                <DailyTask />
                
                {/* 3. Badges & Advanced Statistics Grid */}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Badges Panel */}
                  <div class="glass-panel p-6 rounded-3xl hover-card flex flex-col justify-between min-h-[220px]">
                    <div>
                      <div class="flex items-center gap-2 mb-4">
                        <Award class="w-4 h-4 text-brand-lavender" />
                        <h3 class="text-xs font-semibold tracking-wider text-brand-lavender uppercase">Badges Earned</h3>
                      </div>

                      {(!user.badges || user.badges.length === 0) ? (
                        <div class="py-6 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl text-stone-400 text-xs flex flex-col items-center justify-center h-28">
                          <Heart class="w-5 h-5 mb-1.5 opacity-40 text-stone-400" />
                          No badges unlocked yet.
                        </div>
                      ) : (
                        <div class="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                          {user.badges.map((badgeName) => {
                            const meta = BADGE_META[badgeName] || { icon: "⭐", desc: "Awarded badge" };
                            return (
                              <div 
                                key={badgeName} 
                                class="bg-stone-50/50 dark:bg-stone-900/30 p-2.5 rounded-xl border border-stone-100 dark:border-stone-850 flex items-center gap-2"
                              >
                                <span class="text-xl filter drop-shadow-sm select-none">{meta.icon}</span>
                                <div class="overflow-hidden">
                                  <h4 class="font-bold text-[10px] dark:text-white leading-tight truncate">{badgeName}</h4>
                                  <p class="text-[8px] text-stone-400 mt-0.5 leading-tight truncate">{meta.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    <div class="text-[9px] text-stone-400 mt-2 font-medium">
                      Unlocked {user.badges?.length || 0} of 5 achievements.
                    </div>
                  </div>

                  {/* SoulSync Metrics Widget */}
                  <div class="glass-panel p-6 rounded-3xl hover-card flex flex-col justify-between min-h-[220px]">
                    <div>
                      <div class="flex items-center gap-2 mb-4">
                        <Sparkles class="w-4 h-4 text-brand-mint" />
                        <h3 class="text-xs font-semibold tracking-wider text-brand-mint uppercase">Resilience Insights</h3>
                      </div>

                      <div class="space-y-3">
                        <div class="flex items-center justify-between">
                          <span class="text-xs text-stone-500 dark:text-stone-400 font-medium">Weekly Check-ins</span>
                          <span class="text-xs font-bold text-stone-800 dark:text-white">{moods.length} / 7 Days</span>
                        </div>
                        <div class="w-full h-1 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                          <div class="h-full bg-brand-mint" style={{ width: `${Math.min(100, (moods.length / 7) * 100)}%` }} />
                        </div>

                        <div class="flex items-center justify-between mt-2">
                          <span class="text-xs text-stone-500 dark:text-stone-400 font-medium font-sans">Self-Care Completed</span>
                          <span class="text-xs font-bold text-stone-800 dark:text-white">
                            {user.completedTasksCount || user.streakDays || 0} goals
                          </span>
                        </div>
                        
                        <div class="flex items-start gap-2 bg-brand-mint/5 dark:bg-brand-mint/3 border border-brand-mint/10 p-2.5 rounded-xl mt-1.5">
                          <CheckCircle2 class="w-4 h-4 text-brand-mint flex-shrink-0 mt-0.5" />
                          <p class="text-[10px] text-stone-655 dark:text-stone-400 leading-normal font-medium">
                            Sol is blooming smoothly. Keep completing daily tasks to nourish your streak!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div class="text-[9px] text-stone-400 mt-2 font-medium">
                      Calculated automatically by SoulSync.
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI CHAT LISTENER */}
        {activeTab === 'chat' && <AIListener />}

        {/* TAB 3: MOOD HISTORY */}
        {activeTab === 'history' && <MoodHistory />}

        {/* TAB 4: SAFETY CIRCLE */}
        {activeTab === 'safety' && <SafetyCircle />}

      </main>

      {/* Footer / Crisis Bar Disclaimer */}
      <footer class="max-w-5xl mx-auto px-4 mt-12 pb-4 text-center">
        <p class="text-[10px] text-stone-400 dark:text-stone-500 leading-relaxed max-w-lg mx-auto bg-stone-100/30 dark:bg-stone-900/10 p-4 rounded-2xl border border-stone-200/20 dark:border-stone-850">
          ⚠️ <span class="font-bold text-stone-500">Ethics Disclaimer:</span> SoulSync is an AI wellness assistant designed to encourage daily mindfulness. It is not a substitute for professional clinical therapy or emergency rescue services. 
          If you are in severe distress, contact local services or reach the iCall helpline directly: <span class="font-bold dark:text-stone-300">9152987821</span>.
        </p>
      </footer>

      {/* Floating Bottom Crisis Quick Action Bar */}
      <CrisisBar setActiveTab={setActiveTab} />

      {/* Bottom Mobile Tab Bar (only visible on mobile screens) */}
      <div class="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/80 dark:bg-brand-slate/90 backdrop-blur-md px-2 py-1.5 rounded-full shadow-lg md:hidden flex items-center justify-around z-45 border border-white/40 dark:border-white/5">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          class={`p-2.5 rounded-full transition-colors flex flex-col items-center gap-0.5 ${activeTab === 'dashboard' ? 'bg-brand-lavender/15 text-brand-lavender' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <LayoutDashboard class="w-4 h-4" />
          <span class="text-[8px] font-bold">Home</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          class={`p-2.5 rounded-full transition-colors flex flex-col items-center gap-0.5 ${activeTab === 'chat' ? 'bg-brand-lavender/15 text-brand-lavender' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <MessageSquare class="w-4 h-4" />
          <span class="text-[8px] font-bold">Sol</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          class={`p-2.5 rounded-full transition-colors flex flex-col items-center gap-0.5 ${activeTab === 'history' ? 'bg-brand-lavender/15 text-brand-lavender' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <History class="w-4 h-4" />
          <span class="text-[8px] font-bold">Trend</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('safety')}
          class={`p-2.5 rounded-full transition-colors flex flex-col items-center gap-0.5 ${activeTab === 'safety' ? 'bg-brand-lavender/15 text-brand-lavender' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <Shield class="w-4 h-4" />
          <span class="text-[8px] font-bold">Safety</span>
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <MainAppContent />
      </AppDataProvider>
    </AuthProvider>
  );
}

export default App;
