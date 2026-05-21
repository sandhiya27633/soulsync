import React, { useState, useEffect, useRef } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { Send, AlertTriangle, MessageSquareHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AIListener = () => {
  const { user, isDemoMode } = useAuth();
  const { chats, logChatMessage } = useAppData();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [isAlertingContacts, setIsAlertingContacts] = useState(false);
  const [alertSuccessMessage, setAlertSuccessMessage] = useState('');
  const [aiError, setAiError] = useState('');
  const chatEndRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';

  // --- Keyboard Cadence Sensing State ---
  const typingStartRef = useRef(null);
  const lastKeystrokeTimeRef = useRef(null);
  const backspaceCountRef = useRef(0);
  const longPausesRef = useRef(0);
  const totalCharsRef = useRef(0);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, isLoading]);

  // Handle keystrokes to sense keyboard cadence
  const handleKeyDown = (e) => {
    const now = Date.now();
    
    // Initialize timing on first keystroke
    if (!typingStartRef.current) {
      typingStartRef.current = now;
      lastKeystrokeTimeRef.current = now;
      backspaceCountRef.current = 0;
      longPausesRef.current = 0;
      totalCharsRef.current = 0;
    }

    // Detect long pauses (>5 seconds between keypresses)
    if (lastKeystrokeTimeRef.current && (now - lastKeystrokeTimeRef.current > 5000)) {
      longPausesRef.current += 1;
    }
    lastKeystrokeTimeRef.current = now;

    // Detect backspaces
    if (e.key === 'Backspace') {
      backspaceCountRef.current += 1;
    } else if (e.key.length === 1) {
      totalCharsRef.current += 1;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const messageText = inputValue.trim();
    setInputValue('');

    // 1. Calculate final typing cadence metrics
    const now = Date.now();
    let typingSpeed = 0;
    if (typingStartRef.current && now > typingStartRef.current) {
      const seconds = (now - typingStartRef.current) / 1000;
      typingSpeed = totalCharsRef.current / (seconds || 1);
    }

    const cadenceData = {
      typingSpeed: Number(typingSpeed.toFixed(2)),
      backspaceCount: backspaceCountRef.current,
      longPauses: longPausesRef.current
    };

    // Reset sensing states for the next message
    typingStartRef.current = null;
    lastKeystrokeTimeRef.current = null;
    backspaceCountRef.current = 0;
    longPausesRef.current = 0;
    totalCharsRef.current = 0;

    // 2. Add user message locally and to DB
    // (Note: logChatMessage will handle encrypting it before writing to DB)
    await logChatMessage('user', messageText, 'NORMAL');
    setAiError('');
    setIsLoading(true);

    // 3. Request AI Response from our backend API
    try {
      const chatHistory = [...chats, { sender: 'user', text: messageText }].slice(-10);
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: chatHistory,
          cadence: cadenceData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[DEBUG] /api/chat response', data);
      if (!data || typeof data.reply !== 'string') {
        throw new Error('Invalid AI response format');
      }

      // Save Sol's response
      await logChatMessage('sol', data.reply, data.riskLevel || 'NORMAL');

      // If critical risk level detected, trigger the crisis alert modal!
      if (data.riskLevel === 'CRITICAL') {
        setShowCrisisModal(true);
      }
    } catch (error) {
      console.error('AI Communication error:', error);
      setAiError('Sol is temporarily unavailable. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  // Dispatch Alerts to Safety Circle
  const triggerSafetyAlerts = async () => {
    if (!user.safetyCircle || user.safetyCircle.length === 0) {
      setAlertSuccessMessage("No safety contacts configured. Please add contacts in settings.");
      return;
    }

    setIsAlertingContacts(true);
    setAlertSuccessMessage('');

    let sentCount = 0;
    const backendUrl = BACKEND_URL;

    try {
      for (const contact of user.safetyCircle) {
        const response = await fetch(`${backendUrl}/api/send-sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactName: contact.name,
            contactPhone: contact.phone,
            userName: user.displayName || 'Your friend',
            messageType: 'critical'
          })
        });
        
        if (response.ok) sentCount++;
      }

      if (sentCount > 0) {
        setAlertSuccessMessage(`Alert dispatched to ${sentCount} Safety Circle contact(s).`);
      } else {
        setAlertSuccessMessage("Failed to send alerts. Please reach out manually.");
      }
    } catch (err) {
      console.error("Alerting contacts failed:", err);
      setAlertSuccessMessage("Alerting failed. Please reach out manually.");
    } finally {
      setIsAlertingContacts(false);
    }
  };

  return (
    <div class="flex flex-col bg-white dark:bg-brand-slate rounded-3xl shadow-glass border border-white/40 dark:border-white/5 h-[500px] overflow-hidden max-w-xl mx-auto">
      {/* Header */}
      <div class="px-6 py-4 border-b border-stone-100 dark:border-stone-850 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-brand-lavender/10 flex items-center justify-center text-xl">
            🌱
          </div>
          <div>
            <h3 class="font-bold text-stone-800 dark:text-white flex items-center gap-1.5">
              Chat with Sol
              <span class="inline-block w-2 h-2 rounded-full bg-brand-mint animate-pulse" />
            </h3>
            <p class="text-xs text-stone-400 dark:text-stone-500">Your Empathetic Listening Companion</p>
          </div>
        </div>
        <div class="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider bg-stone-100 dark:bg-stone-800/40 px-2 py-0.5 rounded-full">
          {isDemoMode ? 'Demo Mode' : 'AI Active'}
        </div>
      </div>

      {aiError && (
        <div class="px-6 py-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-200 text-xs leading-relaxed">
          {aiError}
        </div>
      )}

      {/* Messages Scroll Box */}
      <div class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {chats.length === 0 ? (
          <div class="h-full flex flex-col items-center justify-center text-center px-6">
            <div class="w-12 h-12 rounded-full bg-brand-lavender/5 flex items-center justify-center text-brand-lavender mb-3">
              <MessageSquareHeart class="w-6 h-6" />
            </div>
            <h4 class="font-serif font-bold text-stone-700 dark:text-stone-300">Welcome to a Safe Space</h4>
            <p class="text-xs text-stone-400 dark:text-stone-500 max-w-xs mt-1 leading-relaxed">
              I'm Sol, your companion. You can write to me about anything. I listen warmly and without judgment.
            </p>
          </div>
        ) : (
          chats.map((msg, index) => {
            const isSol = msg.sender === 'sol';
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                class={`flex ${isSol ? 'justify-start' : 'justify-end'}`}
              >
                <div class={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  isSol 
                    ? 'bg-brand-cream dark:bg-stone-900/60 text-stone-800 dark:text-stone-200 rounded-tl-none border border-stone-100 dark:border-stone-800/40' 
                    : 'bg-brand-lavender text-white rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            );
          })
        )}
        
        {isLoading && (
          <div class="flex justify-start">
            <div class="bg-brand-cream dark:bg-stone-900/60 rounded-2xl rounded-tl-none px-4 py-3 text-stone-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-brand-lavender animate-bounce" style={{ animationDelay: '0ms' }} />
              <span class="w-1.5 h-1.5 rounded-full bg-brand-lavender animate-bounce" style={{ animationDelay: '150ms' }} />
              <span class="w-1.5 h-1.5 rounded-full bg-brand-lavender animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input Bar */}
      <form onSubmit={handleSendMessage} class="p-4 border-t border-stone-100 dark:border-stone-850 flex gap-2">
        <textarea
          rows="1"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Speak your mind..."
          class="flex-1 px-4 py-3 bg-stone-50 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-850 focus:border-brand-lavender rounded-2xl text-sm focus:outline-none resize-none overflow-hidden max-h-24 dark:text-white"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          class="p-3 bg-brand-lavender text-white rounded-2xl shadow-md hover:bg-brand-accent transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
        >
          <Send class="w-4 h-4" />
        </button>
      </form>

      {/* --- Soft Crisis Response Modal --- */}
      <AnimatePresence>
        {showCrisisModal && (
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              class="bg-white dark:bg-brand-slate rounded-3xl p-6 shadow-2xl border border-rose-100 dark:border-rose-950/20 max-w-sm w-full"
            >
              <div class="flex items-center gap-3 text-rose-500 mb-3">
                <AlertTriangle class="w-6 h-6" />
                <h4 class="font-bold text-lg dark:text-white">We're right here with you</h4>
              </div>
              <p class="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
                It sounds like you're going through something really hard. Would you like us to let someone you trust know? We can send a message to your Safety Circle contacts.
              </p>

              {alertSuccessMessage && (
                <div class="mb-4 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold text-center">
                  {alertSuccessMessage}
                </div>
              )}

              <div class="flex gap-2">
                <button
                  type="button"
                  onClick={triggerSafetyAlerts}
                  disabled={isAlertingContacts}
                  class="flex-1 py-3 bg-rose-500 text-white rounded-2xl font-bold text-sm hover:bg-rose-600 transition-colors shadow-md shadow-rose-500/10 disabled:opacity-50"
                >
                  {isAlertingContacts ? 'Alerting...' : 'Yes, reach out'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCrisisModal(false);
                    setAlertSuccessMessage('');
                  }}
                  class="flex-1 py-3 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-2xl font-semibold text-sm hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                  Not yet
                </button>
              </div>
              
              <div class="mt-4 text-[10px] text-center text-stone-400 dark:text-stone-500">
                SoulSync is not a replacement for medical care. You can also contact iCall at 9152987821.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
