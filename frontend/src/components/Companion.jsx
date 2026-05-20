import React from 'react';
import { motion } from 'framer-motion';

export const Companion = ({ streakDays }) => {
  // Determine evolution stage
  // Stage 0 (0-6 days): Seedling in glass jar
  // Stage 1 (7-13 days): Growing sprout
  // Stage 2 (14-29 days): Budding blossom
  // Stage 3 (30+ days): Radiant bloom with aura
  let stage = 0;
  let stageName = "Sprout Seedling";
  let stageDesc = "Sol is a tiny seed, protected and resting.";

  if (streakDays >= 30) {
    stage = 3;
    stageName = "Radiant Flower-Star";
    stageDesc = "Sol is in full radiant bloom, glowing with your resilience.";
  } else if (streakDays >= 14) {
    stage = 2;
    stageName = "Budding Blossom";
    stageDesc = "Sol is budding, showing a warm, curious smile.";
  } else if (streakDays >= 7) {
    stage = 1;
    stageName = "Growing Sprout";
    stageDesc = "Sol has sprouted! Reaching gently toward the light.";
  }

  return (
    <div class="glass-panel rounded-3xl p-6 hover-card text-center relative overflow-hidden">
      {/* Background soft glow based on stage */}
      <div class={`absolute inset-0 opacity-15 filter blur-3xl -z-10 transition-all duration-1000 ${
        stage === 0 ? 'bg-amber-300' :
        stage === 1 ? 'bg-emerald-300' :
        stage === 2 ? 'bg-purple-300' :
        'bg-yellow-400'
      }`} />

      <h3 class="text-xs font-semibold tracking-wider text-brand-lavender uppercase mb-2">Companion Character</h3>
      
      {/* Stage Badge */}
      <span class="inline-block px-3 py-1 bg-brand-lavender/10 text-brand-lavender rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
        Stage {stage}: {stageName}
      </span>

      {/* Interactive SVG Rendering with Gradients */}
      <div class="w-48 h-48 mx-auto flex items-center justify-center relative">
        <motion.div
          animate={stage === 3 ? "float" : "breathe"}
          variants={{
            breathe: {
              scale: [1, 1.03, 1],
              transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            },
            float: {
              y: [0, -8, 0],
              transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }
          }}
          class="w-full h-full"
        >
          {/* Evolution Stage 0: Seedling in glass jar */}
          {stage === 0 && (
            <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-lg">
              <defs>
                <linearGradient id="jarGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8"/>
                  <stop offset="30%" stopColor="#e0f2fe" stopOpacity="0.4"/>
                  <stop offset="70%" stopColor="#bae6fd" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="seedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#d97706"/>
                </linearGradient>
                <linearGradient id="corkGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#b45309"/>
                  <stop offset="100%" stopColor="#78350f"/>
                </linearGradient>
              </defs>
              {/* Jar lid / cork */}
              <rect x="36" y="25" width="28" height="6" rx="2" fill="url(#corkGrad)" />
              {/* Jar Body */}
              <path d="M36 31 C 36 31, 20 40, 20 60 C 20 80, 30 85, 50 85 C 70 85, 80 80, 80 60 C 80 40, 64 31, 64 31 Z" fill="url(#jarGrad)" stroke="#ffffff" strokeWidth="1.5" />
              {/* Water / Soil inside */}
              <path d="M22 68 C 22 68, 35 65, 50 68 C 65 70, 78 68, 78 68 C 78 75, 74 83, 50 83 C 26 83, 22 75, 22 68 Z" fill="#d97706" opacity="0.15" />
              {/* Seed */}
              <ellipse cx="50" cy="70" rx="7" ry="5" fill="url(#seedGrad)" />
              <path d="M47 70 Q 50 68 53 70" stroke="#78350f" strokeWidth="0.75" fill="none" />
              {/* Happy eyes on seed */}
              <circle cx="47" cy="68" r="0.75" fill="#78350f" />
              <circle cx="53" cy="68" r="0.75" fill="#78350f" />
              {/* Sprout light ray */}
              <path d="M50 65 Q 48 55 53 48" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M53 48 Q 57 47 55 52 Q 53 50 53 48 Z" fill="#34d399" />
              {/* Sparkles */}
              <circle cx="28" cy="45" r="1.5" fill="#fef08a" opacity="0.6" />
              <circle cx="72" cy="52" r="1" fill="#fef08a" opacity="0.6" />
            </svg>
          )}

          {/* Evolution Stage 1: Growing sprout */}
          {stage === 1 && (
            <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="potGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fb923c"/>
                  <stop offset="100%" stopColor="#c2410c"/>
                </linearGradient>
                <linearGradient id="stemGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399"/>
                  <stop offset="100%" stopColor="#059669"/>
                </linearGradient>
              </defs>
              {/* Clay Pot */}
              <path d="M30 65 L 70 65 L 64 88 L 36 88 Z" fill="url(#potGrad)" />
              <rect x="26" y="60" width="48" height="6" rx="2" fill="#ea580c" />
              
              {/* Stem */}
              <path d="M50 60 Q 48 40 54 25" stroke="url(#stemGrad)" strokeWidth="3" strokeLinecap="round" fill="none" />
              
              {/* Left Leaf */}
              <path d="M49 48 Q 38 42 36 50 Q 44 52 49 48 Z" fill="#10b981" />
              {/* Right Leaf */}
              <path d="M51 40 Q 64 35 62 44 Q 54 44 51 40 Z" fill="#10b981" />
              
              {/* Smile on the stem leaf */}
              <circle cx="45" cy="47" r="0.75" fill="#047857" />
              <circle cx="41" cy="47" r="0.75" fill="#047857" />
              <path d="M42 49 Q 43 51 44 49" stroke="#047857" strokeWidth="0.5" fill="none" />
            </svg>
          )}

          {/* Evolution Stage 2: Budding blossom */}
          {stage === 2 && (
            <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-xl">
              <defs>
                <linearGradient id="potGrad2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fdba74"/>
                  <stop offset="100%" stopColor="#ea580c"/>
                </linearGradient>
                <linearGradient id="budGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc"/>
                  <stop offset="100%" stopColor="#7c3aed"/>
                </linearGradient>
              </defs>
              {/* Pot */}
              <path d="M30 65 L 70 65 L 64 88 L 36 88 Z" fill="url(#potGrad2)" />
              <rect x="26" y="60" width="48" height="6" rx="2" fill="#d97706" />
              
              {/* Stem & Leaves */}
              <path d="M50 60 Q 50 45 50 35" stroke="#059669" strokeWidth="3" fill="none" />
              <path d="M50 50 Q 38 45 40 52 Q 48 53 50 50 Z" fill="#10b981" />
              <path d="M50 45 Q 62 40 60 48 Q 52 48 50 45 Z" fill="#10b981" />

              {/* Bud head */}
              <path d="M50 20 C 40 20, 38 38, 50 40 C 62 38, 60 20, 50 20 Z" fill="url(#budGrad)" />
              {/* Inner Petals detail */}
              <path d="M47 22 C 43 25, 43 32, 50 38 C 57 32, 57 25, 53 22 Z" fill="#a78bfa" opacity="0.6" />

              {/* Sol Face details */}
              <circle cx="46" cy="30" r="1" fill="#fff" />
              <circle cx="54" cy="30" r="1" fill="#fff" />
              <path d="M48 34 Q 50 36 52 34" stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" />
            </svg>
          )}

          {/* Evolution Stage 3: Radiant Flower-Star */}
          {stage === 3 && (
            <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-2xl">
              <defs>
                <linearGradient id="flowerGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef08a"/>
                  <stop offset="50%" stopColor="#a78bfa"/>
                  <stop offset="100%" stopColor="#7c3aed"/>
                </linearGradient>
                <radialGradient id="auraGrad">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8"/>
                  <stop offset="60%" stopColor="#c084fc" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
                </radialGradient>
              </defs>
              
              {/* Back Aura */}
              <circle cx="50" cy="45" r="28" fill="url(#auraGrad)" />
              
              {/* Pot */}
              <path d="M32 70 L 68 70 L 62 90 L 38 90 Z" fill="#7c3aed" opacity="0.15" />
              <path d="M30 65 L 70 65 L 64 88 L 36 88 Z" fill="#e9d5ff" />
              <rect x="26" y="60" width="48" height="6" rx="2" fill="#c084fc" />

              {/* Stem */}
              <path d="M50 60 L 50 45" stroke="#10b981" strokeWidth="3.5" fill="none" />
              <path d="M50 53 Q 40 50 42 56 Q 48 57 50 53 Z" fill="#34d399" />
              
              {/* Petals (Star formation) */}
              <g transform="translate(50, 42)">
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <path
                    key={deg}
                    d="M0 -3 Q -8 -15 0 -22 Q 8 -15 0 -3"
                    fill="url(#flowerGrad)"
                    transform={`rotate(${deg})`}
                  />
                ))}
              </g>

              {/* Flower Center */}
              <circle cx="50" cy="42" r="10" fill="#fef08a" stroke="#facc15" strokeWidth="1" />
              
              {/* Cute smiling face */}
              <circle cx="47" cy="40" r="1" fill="#7c2d12" />
              <circle cx="53" cy="40" r="1" fill="#7c2d12" />
              <path d="M47 43 Q 50 46 53 43" stroke="#7c2d12" strokeWidth="1" strokeLinecap="round" fill="none" />
              
              {/* Rosy cheeks */}
              <circle cx="45" cy="42" r="1" fill="#f43f5e" opacity="0.6" />
              <circle cx="55" cy="42" r="1" fill="#f43f5e" opacity="0.6" />
              
              {/* Golden Crown */}
              <path d="M44 26 L 46 29 L 50 25 L 54 29 L 56 26 L 54 31 L 46 31 Z" fill="#facc15" />
            </svg>
          )}
        </motion.div>
      </div>

      {/* Description Text */}
      <h4 class="font-serif font-bold text-stone-800 dark:text-white text-base mt-4">{stageName}</h4>
      <p class="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto leading-relaxed">
        {stageDesc}
      </p>

      {/* Progression Indicator */}
      <div class="mt-6 pt-4 border-t border-stone-100 dark:border-stone-850 flex items-center justify-between text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
        <span>Seedling</span>
        <span>Sprout</span>
        <span>Bud</span>
        <span>Radiant Bloom</span>
      </div>
      <div class="w-full h-1 bg-stone-100 dark:bg-stone-800 rounded-full mt-1.5 overflow-hidden">
        <div 
          class="bg-brand-lavender h-full rounded-full transition-all duration-1000" 
          style={{ width: `${Math.min(100, (streakDays / 30) * 100)}%` }} 
        />
      </div>
    </div>
  );
};
