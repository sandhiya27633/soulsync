import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { MessageSquare, PhoneCall, AlertCircle, VolumeX, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CrisisBar = ({ setActiveTab }) => {
  const { user } = useAuth();
  const { awardBadge } = useAppData();
  const [showCallModal, setShowCallModal] = useState(false);
  const [alertStatus, setAlertStatus] = useState(null); // 'sending', 'success', 'error'
  const [alertMsg, setAlertMsg] = useState('');

  if (!user) return null;

  const contacts = user.safetyCircle || [];
  const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';

  const triggerAlert = async (type) => {
    if (contacts.length === 0) {
      setAlertStatus('error');
      setAlertMsg('No contacts in your Safety Circle. Please add contacts in settings.');
      return;
    }

    setAlertStatus('sending');
    setAlertMsg(type === 'silent' ? 'Sending silent alerts...' : 'Sending emergency alerts...');
    
    let sentCount = 0;
    try {
      for (const contact of contacts) {
        const response = await fetch(`${BACKEND_URL}/api/send-sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactName: contact.name,
            contactPhone: contact.phone,
            userName: user.displayName || 'Your friend',
            messageType: type // 'silent' or 'critical'
          })
        });

        if (response.ok) sentCount++;
      }

      if (sentCount > 0) {
        setAlertStatus('success');
        setAlertMsg(
          type === 'silent' 
            ? 'Silent alert sent to your Safety Circle.' 
            : 'Emergency alert sent. Please stay calm, help is on the way.'
        );
        // Award badge for reaching out
        await awardBadge("Reached out for help");
      } else {
        setAlertStatus('error');
        setAlertMsg('Failed to send alerts. Please dial support directly.');
      }
    } catch (err) {
      console.error("Crisis dispatch error:", err);
      setAlertStatus('error');
      setAlertMsg('Failed to dispatch alerts. Please reach out manually.');
    }
  };

  return (
    <>
      {/* Floating Bottom Bar */}
      <div class="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-stone-900/90 dark:bg-stone-950/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between text-white z-40 border border-stone-850">
        
        {/* Stay with me */}
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          class="flex flex-col items-center gap-1 group text-stone-305 hover:text-white transition-colors"
        >
          <div class="p-2 group-hover:bg-stone-800 rounded-xl transition-colors">
            <MessageSquare class="w-5 h-5 text-brand-mint" />
          </div>
          <span class="text-[9px] font-bold uppercase tracking-wider">Stay with me</span>
        </button>

        {/* Call someone */}
        <button
          type="button"
          onClick={() => setShowCallModal(true)}
          class="flex flex-col items-center gap-1 group text-stone-305 hover:text-white transition-colors"
        >
          <div class="p-2 group-hover:bg-stone-800 rounded-xl transition-colors">
            <PhoneCall class="w-5 h-5 text-brand-lavender" />
          </div>
          <span class="text-[9px] font-bold uppercase tracking-wider">Call someone</span>
        </button>

        {/* I'm not safe */}
        <button
          type="button"
          onClick={() => triggerAlert('critical')}
          class="flex flex-col items-center gap-1 group text-stone-305 hover:text-white transition-colors"
        >
          <div class="p-2 bg-rose-500/20 hover:bg-rose-500/40 rounded-xl transition-colors">
            <ShieldAlert class="w-5 h-5 text-rose-455" />
          </div>
          <span class="text-[9px] font-bold uppercase tracking-wider text-rose-350">I'm not safe</span>
        </button>

        {/* I can't talk */}
        <button
          type="button"
          onClick={() => triggerAlert('silent')}
          class="flex flex-col items-center gap-1 group text-stone-350 hover:text-white transition-colors"
        >
          <div class="p-2 group-hover:bg-stone-800 rounded-xl transition-colors">
            <VolumeX class="w-5 h-5 text-stone-400" />
          </div>
          <span class="text-[9px] font-bold uppercase tracking-wider">I can't talk</span>
        </button>
      </div>

      {/* Action / Success Modals */}
      <AnimatePresence>
        {(alertStatus || showCallModal) && (
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              class="bg-white dark:bg-brand-slate rounded-3xl p-6 shadow-2xl border border-stone-100 dark:border-stone-850 max-w-sm w-full relative"
            >
              <button
                type="button"
                onClick={() => {
                  setShowCallModal(false);
                  setAlertStatus(null);
                  setAlertMsg('');
                }}
                class="absolute right-4 top-4 p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400"
              >
                <X class="w-4 h-4" />
              </button>

              {/* Call Modal */}
              {showCallModal && (
                <div>
                  <h4 class="font-serif font-bold text-lg dark:text-white mb-3">Call a Trusted Friend</h4>
                  <p class="text-xs text-stone-500 dark:text-stone-400 mb-4 leading-relaxed">
                    Select a contact from your Safety Circle to dial directly from your device:
                  </p>

                  <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {contacts.length === 0 ? (
                      <div class="text-center py-6 text-stone-400 text-xs">
                        No contacts available. Set them up in Settings.
                      </div>
                    ) : (
                      contacts.map((c) => (
                        <a
                          key={c.id}
                          href={`tel:${c.phone}`}
                          class="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-900/30 border border-stone-100 dark:border-stone-850 rounded-xl hover:bg-brand-lavender/5 transition-colors"
                        >
                          <div>
                            <div class="font-bold text-sm dark:text-white">{c.name}</div>
                            <div class="text-[10px] text-stone-400">{c.relationship}</div>
                          </div>
                          <PhoneCall class="w-4 h-4 text-brand-lavender" />
                        </a>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Alert Status Modal */}
              {alertStatus && (
                <div class="text-center py-4">
                  {alertStatus === 'sending' && (
                    <div class="flex flex-col items-center gap-3">
                      <div class="w-12 h-12 rounded-full border-4 border-brand-lavender border-t-transparent animate-spin" />
                      <h4 class="font-bold text-lg dark:text-white">Sending Alerts...</h4>
                      <p class="text-xs text-stone-500 dark:text-stone-400">{alertMsg}</p>
                    </div>
                  )}

                  {alertStatus === 'success' && (
                    <div class="flex flex-col items-center gap-3">
                      <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                        ✓
                      </div>
                      <h4 class="font-bold text-lg dark:text-white">Alerts Dispatched</h4>
                      <p class="text-xs text-stone-600 dark:text-stone-300 leading-relaxed px-2">{alertMsg}</p>
                      
                      <p class="text-[10px] text-stone-400 mt-2">
                        If you need immediate professional help, dial iCall: 9152987821.
                      </p>
                    </div>
                  )}

                  {alertStatus === 'error' && (
                    <div class="flex flex-col items-center gap-3">
                      <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                        <AlertCircle class="w-6 h-6" />
                      </div>
                      <h4 class="font-bold text-lg dark:text-white">Alert Error</h4>
                      <p class="text-xs text-rose-600 dark:text-rose-400 leading-relaxed px-2">{alertMsg}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
