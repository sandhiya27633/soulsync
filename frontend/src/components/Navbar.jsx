import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, MessageSquare, History, Shield, Sun, Moon, LogOut, Award } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('soulsync_theme') || 'light');

  // Sync theme to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('soulsync_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (!user) return null;

  // Calculate XP Level (every 100 XP is a level)
  const xp = user.xp || 0;
  const currentLevel = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;

  return (
    <nav class="bg-white dark:bg-brand-slate border-b border-stone-100 dark:border-stone-850 px-6 py-4 sticky top-0 z-30 shadow-sm transition-colors duration-300">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        
        {/* Logo / Brand */}
        <div class="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <span class="text-2xl select-none">🌱</span>
          <span class="font-serif font-bold text-xl tracking-tight dark:text-white">
            Soul<span class="text-brand-lavender">Sync</span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div class="hidden md:flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            class={`flex items-center gap-2 text-sm font-bold tracking-wide transition-colors ${
              activeTab === 'dashboard' 
                ? 'text-brand-lavender' 
                : 'text-stone-400 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <LayoutDashboard class="w-4 h-4" /> Dashboard
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            class={`flex items-center gap-2 text-sm font-bold tracking-wide transition-colors ${
              activeTab === 'chat' 
                ? 'text-brand-lavender' 
                : 'text-stone-400 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <MessageSquare class="w-4 h-4" /> Sol Chat
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            class={`flex items-center gap-2 text-sm font-bold tracking-wide transition-colors ${
              activeTab === 'history' 
                ? 'text-brand-lavender' 
                : 'text-stone-400 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <History class="w-4 h-4" /> History
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('safety')}
            class={`flex items-center gap-2 text-sm font-bold tracking-wide transition-colors ${
              activeTab === 'safety' 
                ? 'text-brand-lavender' 
                : 'text-stone-400 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <Shield class="w-4 h-4" /> Safety Circle
          </button>
        </div>

        {/* Right Action panel */}
        <div class="flex items-center gap-4">
          
          {/* Level Badge & XP Tracker */}
          <div class="flex items-center gap-2 bg-stone-50 dark:bg-stone-900/50 px-3 py-1.5 rounded-full border border-stone-100 dark:border-stone-850">
            <Award class="w-4 h-4 text-brand-mint" />
            <div class="flex flex-col">
              <span class="text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase leading-none">LVL {currentLevel}</span>
              <div class="w-16 h-1 bg-stone-200 dark:bg-stone-800 rounded-full mt-1 overflow-hidden">
                <div class="bg-brand-mint h-full" style={{ width: `${xpInLevel}%` }} />
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            class="p-2 text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/50 rounded-full border border-stone-100 dark:border-stone-850 transition-colors"
          >
            {theme === 'light' ? <Moon class="w-4 h-4" /> : <Sun class="w-4 h-4 text-amber-400" />}
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            class="p-2 text-stone-400 hover:text-rose-500 rounded-full hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors"
            title="Sign Out"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};
