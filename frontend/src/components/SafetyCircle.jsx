import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { ShieldCheck, Plus, Trash2, Heart, ToggleLeft, ToggleRight, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SafetyCircle = () => {
  const { user, updateProfile } = useAuth();
  const { awardBadge } = useAppData();
  
  // Forms states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Friend');

  if (!user) return null;

  const contacts = user.safetyCircle || [];
  const enableAutoAlerts = user.enableAutoAlerts || false;

  const handleToggleAutoAlerts = async () => {
    await updateProfile({ enableAutoAlerts: !enableAutoAlerts });
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    // Build contact object
    const newContact = {
      id: 'sc_' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      phone: phone.trim(),
      relationship
    };

    const updatedCircle = [...contacts, newContact];
    await updateProfile({ safetyCircle: updatedCircle });
    
    // Award "First Connection" badge!
    if (updatedCircle.length === 1) {
      await awardBadge("First Connection");
    }

    // Reset Form
    setName('');
    setPhone('');
    setRelationship('Friend');
    setShowAddForm(false);
  };

  const handleDeleteContact = async (contactId) => {
    const updatedCircle = contacts.filter(c => c.id !== contactId);
    await updateProfile({ safetyCircle: updatedCircle });
  };

  return (
    <div class="bg-white dark:bg-brand-slate p-6 rounded-3xl shadow-glass border border-white/40 dark:border-white/5 max-w-md mx-auto">
      <div class="flex items-center gap-2 mb-2">
        <ShieldCheck class="w-5 h-5 text-brand-lavender" />
        <h3 class="text-sm font-semibold tracking-wider text-brand-lavender uppercase">Safety Circle</h3>
      </div>

      <h4 class="text-xl font-bold font-serif dark:text-white mb-2">Your Trusted Support Circle</h4>
      <p class="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed bg-stone-50 dark:bg-stone-900/30 p-3 rounded-2xl border border-stone-100 dark:border-stone-850">
        🛡️ <span class="font-bold">Consent text:</span> These people will only be contacted if you explicitly click the safety alert button or consent in a critical state. You can change this list anytime.
      </p>

      {/* Auto Alerts Toggle */}
      <div class="flex items-center justify-between p-4 bg-brand-lavender/5 border border-brand-lavender/10 rounded-2xl mb-6">
        <div>
          <h5 class="text-sm font-bold dark:text-white">Enable automatic alert popups</h5>
          <p class="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">Prompt to alert contacts immediately on critical sentiment detection.</p>
        </div>
        <button 
          type="button" 
          onClick={handleToggleAutoAlerts} 
          class="focus:outline-none text-brand-lavender"
        >
          {enableAutoAlerts ? (
            <ToggleRight class="w-12 h-12 text-brand-mint" />
          ) : (
            <ToggleLeft class="w-12 h-12 text-stone-300 dark:text-stone-700" />
          )}
        </button>
      </div>

      {/* Contacts List */}
      <div class="space-y-3 mb-6">
        <h5 class="text-xs font-bold text-stone-450 uppercase tracking-wider">Trusted Contacts ({contacts.length})</h5>
        
        {contacts.length === 0 ? (
          <div class="text-center py-8 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50/10 dark:bg-stone-900/5 text-stone-400">
            <Heart class="w-6 h-6 mx-auto mb-2 text-stone-300 dark:text-stone-750" />
            <p class="text-xs">Your circle is empty. Add a trusted contact below.</p>
          </div>
        ) : (
          <AnimatePresence>
            {contacts.map((contact) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                class="flex items-center justify-between p-3.5 bg-stone-50 dark:bg-stone-900/30 border border-stone-100 dark:border-stone-850 rounded-2xl"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-brand-lavender/15 text-brand-lavender flex items-center justify-center text-xs font-bold">
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <h6 class="font-bold text-stone-800 dark:text-white text-sm flex items-center gap-2">
                      {contact.name}
                      <span class="text-[9px] font-bold bg-brand-lavender/10 text-brand-lavender px-1.5 py-0.5 rounded">
                        {contact.relationship}
                      </span>
                    </h6>
                    <p class="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                      <Phone class="w-3 h-3" /> {contact.phone}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteContact(contact.id)}
                  class="p-2 text-stone-400 hover:text-rose-500 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add Contact Form Toggle */}
      {!showAddForm ? (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          class="w-full py-3 border border-dashed border-brand-lavender/40 text-brand-lavender bg-brand-lavender/5 rounded-2xl hover:bg-brand-lavender/10 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-1.5"
        >
          <Plus class="w-4 h-4" /> Add Trusted Person
        </button>
      ) : (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleAddContact}
          class="space-y-3 bg-stone-50/50 dark:bg-stone-900/10 p-4 border border-stone-150 dark:border-stone-850 rounded-2xl"
        >
          <div>
            <label htmlFor="c-name" class="block text-[10px] font-bold text-stone-450 uppercase mb-1">Full Name</label>
            <input
              id="c-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Doe"
              class="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:border-brand-lavender rounded-xl text-sm focus:outline-none dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="c-phone" class="block text-[10px] font-bold text-stone-450 uppercase mb-1">Phone Number</label>
            <input
              id="c-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1234567890"
              class="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:border-brand-lavender rounded-xl text-sm focus:outline-none dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="c-rel" class="block text-[10px] font-bold text-stone-450 uppercase mb-1">Relationship</label>
            <select
              id="c-rel"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              class="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:border-brand-lavender rounded-xl text-sm focus:outline-none dark:text-white"
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
          
          <div class="flex gap-2 pt-2">
            <button
              type="submit"
              class="flex-1 py-2.5 bg-brand-lavender text-white rounded-xl text-xs font-bold hover:bg-brand-accent transition-colors"
            >
              Save Contact
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              class="flex-1 py-2.5 bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-xl text-xs font-semibold hover:bg-stone-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
};
