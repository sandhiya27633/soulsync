import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Mail, Lock, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Onboarding = ({ onComplete }) => {
  const { login, signup, loginWithGoogle, updateProfile } = useAuth();
  
  // App view toggles
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [step, setStep] = useState('auth'); // 'auth' | 'safety_setup'
  
  // Auth Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Safety Contacts state
  const [tempContacts, setTempContacts] = useState([]);
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cRel, setCRel] = useState('Friend');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLoginTab) {
        await login(email, password);
        onComplete(); // Skip safety setup if logging in existing user
      } else {
        await signup(email, password, name);
        // Direct to safety contacts setup on fresh signup
        setStep('safety_setup');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const userCred = await loginWithGoogle();
      // Check if user already has safety contacts in profile
      const localUsers = JSON.parse(localStorage.getItem('soulsync_mock_users') || '{}');
      const profile = localUsers[userCred.uid];
      
      if (profile && profile.safetyCircle && profile.safetyCircle.length > 0) {
        onComplete();
      } else {
        setStep('safety_setup');
      }
    } catch (err) {
      console.error(err);
      setError("Google Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSafetyContact = (e) => {
    e.preventDefault();
    if (!cName.trim() || !cPhone.trim()) return;

    const newContact = {
      id: 'sc_init_' + Math.random().toString(36).substr(2, 9),
      name: cName.trim(),
      phone: cPhone.trim(),
      relationship: cRel
    };

    setTempContacts([...tempContacts, newContact]);
    setCName('');
    setCPhone('');
    setCRel('Friend');
  };

  const handleFinishOnboarding = async () => {
    if (tempContacts.length === 0) {
      setError("Please add at least 1 safety contact to proceed.");
      return;
    }
    setLoading(true);
    try {
      await updateProfile({ safetyCircle: tempContacts });
      onComplete();
    } catch (err) {
      console.error(err);
      setError("Failed to save your safety circle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-brand-cream dark:bg-brand-charcoal flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-white dark:bg-brand-slate rounded-3xl shadow-glass border border-white/40 dark:border-white/5 overflow-hidden">
        
        {/* Step 1: Authentication */}
        {step === 'auth' && (
          <div class="p-8">
            <div class="text-center mb-6">
              <span class="inline-block px-3 py-1 bg-brand-lavender/10 text-brand-lavender rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                🌱 SoulSync
              </span>
              <h2 class="text-3xl font-bold font-serif dark:text-white">Begin Your Journey</h2>
              <p class="text-xs text-stone-400 dark:text-stone-500 mt-1">An AI Self-Care Companion with Safety Intelligence</p>
            </div>

            {/* Auth Tab Switcher */}
            <div class="flex border-b border-stone-100 dark:border-stone-850 mb-6">
              <button
                type="button"
                onClick={() => { setIsLoginTab(true); setError(''); }}
                class={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                  isLoginTab 
                    ? 'border-brand-lavender text-brand-charcoal dark:text-white' 
                    : 'border-transparent text-stone-400 dark:text-stone-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLoginTab(false); setError(''); }}
                class={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                  !isLoginTab 
                    ? 'border-brand-lavender text-brand-charcoal dark:text-white' 
                    : 'border-transparent text-stone-400 dark:text-stone-600'
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div class="mb-4 p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl text-xs font-semibold text-center border border-rose-100 dark:border-rose-900/10">
                {error}
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleAuthSubmit} class="space-y-4">
              {!isLoginTab && (
                <div>
                  <label htmlFor="auth-name" class="block text-[10px] font-bold text-stone-450 uppercase mb-1">First Name</label>
                  <div class="relative">
                    <User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      id="auth-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      class="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-250 dark:border-stone-800 focus:border-brand-lavender rounded-2xl text-sm focus:outline-none dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="auth-email" class="block text-[10px] font-bold text-stone-450 uppercase mb-1">Email Address</label>
                <div class="relative">
                  <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    class="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-250 dark:border-stone-800 focus:border-brand-lavender rounded-2xl text-sm focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="auth-pass" class="block text-[10px] font-bold text-stone-450 uppercase mb-1">Password</label>
                <div class="relative">
                  <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    id="auth-pass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    class="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-250 dark:border-stone-800 focus:border-brand-lavender rounded-2xl text-sm focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                class="w-full py-3 bg-brand-lavender text-white rounded-2xl font-semibold shadow-md hover:bg-brand-accent transition-all duration-300 disabled:opacity-50 mt-2"
              >
                {loading ? 'Processing...' : isLoginTab ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div class="relative flex py-4 items-center">
              <div class="flex-grow border-t border-stone-100 dark:border-stone-850"></div>
              <span class="flex-shrink mx-4 text-stone-400 text-xs uppercase font-bold">Or</span>
              <div class="flex-grow border-t border-stone-100 dark:border-stone-850"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              class="w-full py-3 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 rounded-2xl font-semibold text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.19-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>
        )}

        {/* Step 2: Safety Circle Setup */}
        {step === 'safety_setup' && (
          <div class="p-8">
            <div class="text-center mb-6">
              <span class="inline-block p-3 bg-brand-lavender/10 text-brand-lavender rounded-full mb-3">
                <ShieldCheck class="w-8 h-8" />
              </span>
              <h2 class="text-2xl font-bold font-serif dark:text-white">Secure Your Safety Circle</h2>
              <p class="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed bg-stone-50 dark:bg-stone-900/30 p-3.5 rounded-2xl border border-stone-100 dark:border-stone-850">
                🛡️ <span class="font-bold">Consent text:</span> These people will only be contacted if you are in a critical state or initiate help. You can change this list anytime.
              </p>
            </div>

            {error && (
              <div class="mb-4 p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl text-xs font-semibold text-center">
                {error}
              </div>
            )}

            {/* List current added contacts */}
            <div class="space-y-2 mb-4">
              {tempContacts.map((c, idx) => (
                <div key={idx} class="flex items-center justify-between p-2.5 bg-brand-cream dark:bg-stone-900/50 rounded-xl text-xs border border-stone-100 dark:border-stone-800">
                  <div>
                    <span class="font-bold dark:text-white">{c.name}</span> <span class="text-stone-400">({c.relationship})</span>
                    <div class="text-[10px] text-stone-400 mt-0.5">{c.phone}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTempContacts(tempContacts.filter((_, i) => i !== idx))}
                    class="text-rose-500 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Add Contact Form (only show if contacts < 3) */}
            {tempContacts.length < 3 ? (
              <form onSubmit={handleAddSafetyContact} class="space-y-3 p-4 bg-stone-50 dark:bg-stone-900/20 border border-stone-100 dark:border-stone-850 rounded-2xl mb-4">
                <h4 class="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Add Contact ({tempContacts.length + 1}/3)</h4>
                
                <div>
                  <input
                    type="text"
                    required
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    placeholder="Name"
                    class="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:border-brand-lavender rounded-xl text-xs focus:outline-none dark:text-white"
                  />
                </div>
                
                <div>
                  <input
                    type="tel"
                    required
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    placeholder="Phone number (+123456789)"
                    class="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:border-brand-lavender rounded-xl text-xs focus:outline-none dark:text-white"
                  />
                </div>
                
                <div>
                  <select
                    value={cRel}
                    onChange={(e) => setCRel(e.target.value)}
                    class="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:border-brand-lavender rounded-xl text-xs focus:outline-none dark:text-white"
                  >
                    <option value="Friend">Friend</option>
                    <option value="Partner">Partner</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Parent">Parent</option>
                    <option value="Therapist">Therapist</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  class="w-full py-2 bg-brand-lavender text-white rounded-xl text-xs font-bold hover:bg-brand-accent transition-colors"
                >
                  Add Contact
                </button>
              </form>
            ) : (
              <p class="text-xs text-stone-400 text-center mb-4">You have added the maximum of 3 safety contacts.</p>
            )}

            <button
              type="button"
              onClick={handleFinishOnboarding}
              disabled={tempContacts.length === 0}
              class="w-full py-3.5 bg-brand-mint text-stone-800 rounded-2xl font-bold hover:bg-emerald-300 transition-colors shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Finish Setup & Start <ArrowRight class="w-4 h-4" />
            </button>
            
            {tempContacts.length === 0 && (
              <p class="text-[10px] text-center text-rose-500 mt-2 font-semibold">
                * At least 1 contact is required to initialize SoulSync Safety Intelligence.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
