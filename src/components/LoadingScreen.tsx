import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, animate, useMotionValue, useReducedMotion } from 'framer-motion';
import { Lightbulb, Code2, Settings, Rocket, Users, type LucideIcon } from 'lucide-react';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Smooth waypoints the progress tweens through (not a hard-coded instant jump).
const PROGRESS_KEYFRAMES = [0, 12, 27, 43, 61, 78, 91, 100];

const STAGE_LABELS: { at: number; text: string }[] = [
  { at: 0, text: 'Initializing systems...' },
  { at: 25, text: 'Loading AI Experience...' },
  { at: 60, text: 'Calibrating interface...' },
  { at: 90, text: 'Finalizing launch...' },
];

const getStageLabel = (pct: number) =>
  [...STAGE_LABELS].reverse().find((s) => pct >= s.at)?.text ?? STAGE_LABELS[0].text;

type Feature = { icon: LucideIcon; label: string; threshold: number; color: string };

const FEATURES: Feature[] = [
  { icon: Lightbulb, label: 'Smart ideas', threshold: 24, color: '#22d3ee' },
  { icon: Code2, label: 'Clean code', threshold: 38, color: '#38bdf8' },
  { icon: Settings, label: 'Better tools', threshold: 52, color: '#818cf8' },
  { icon: Rocket, label: 'Faster build', threshold: 66, color: '#c084fc' },
  { icon: Users, label: 'Bigger impact', threshold: 80, color: '#67e8f9' },
];

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const progressValue = useMotionValue(0);

  useEffect(() => {
    let holdTimeout: ReturnType<typeof setTimeout>;
    const unsubscribe = progressValue.on('change', (v) => setProgress(v));
    const controls = animate(progressValue, PROGRESS_KEYFRAMES, {
      duration: shouldReduceMotion ? 0.5 : 3.4,
      ease: [0.65, 0, 0.35, 1],
      onComplete: () => {
        holdTimeout = setTimeout(onComplete, shouldReduceMotion ? 150 : 700);
      },
    });

    return () => {
      controls.stop();
      unsubscribe();
      clearTimeout(holdTimeout);
    };
  }, [shouldReduceMotion, onComplete, progressValue]);

  const pct = Math.min(Math.round(progress), 100);
  const label = getStageLabel(pct);
  const announced = `${label} ${Math.floor(pct / 10) * 10}% complete`;

  // Staged reveals derived from progress, per the requested cinematic sequence.
  const ringReveal = Math.max(0.2, clamp01((pct - 2) / 16)); // visible almost immediately, full by ~18%
  const logoReveal = clamp01((pct - 18) / 20); // 18% -> 38%
  const wavesOpacity = clamp01((pct - 50) / 25); // 50% -> 75%
  const finalGlow = clamp01((pct - 88) / 12); // 88% -> 100%
  const ringGlow = 10 + ringReveal * 8 + finalGlow * 14;

  const stars = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        left: `${(i * 37) % 100}%`,
        top: `${(i * 53) % 100}%`,
        size: i % 5 === 0 ? 2 : 1,
        dur: 2.5 + (i % 4),
        delay: (i % 6) * 0.4,
      })),
    []
  );

  const farStars = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        left: `${(i * 23 + 7) % 100}%`,
        top: `${(i * 41 + 11) % 100}%`,
        dur: 3.5 + (i % 5),
        delay: (i % 7) * 0.5,
      })),
    []
  );

  const radius = 62;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden px-4"
      style={{
        background:
          'radial-gradient(ellipse 90% 60% at 50% 28%, hsl(230 45% 9%) 0%, hsl(230 55% 4%) 45%, hsl(240 70% 2%) 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: shouldReduceMotion ? 0.2 : 0.7, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="sr-only" role="status" aria-live="polite" aria-busy={pct < 100}>
        {announced}
      </div>

      {/* ---------- Background layer ---------- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Ambient glows */}
        <motion.div
          className="absolute w-[420px] h-[420px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.22), transparent 70%)', top: '14%', left: '20%' }}
          animate={shouldReduceMotion ? undefined : { scale: [1, 1.25, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[380px] h-[380px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.2), transparent 70%)', bottom: '18%', right: '18%' }}
          animate={shouldReduceMotion ? undefined : { scale: [1.15, 0.95, 1.15], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Flowing neon wave ribbons */}
        <svg
          className={`absolute left-1/2 top-1/2 w-[160%] max-w-none -translate-x-1/2 -translate-y-1/2 ${shouldReduceMotion ? '' : 'animate-[wave-drift_22s_ease-in-out_infinite]'}`}
          style={{ mixBlendMode: 'screen', opacity: 0.15 + wavesOpacity * 0.55 }}
          viewBox="0 0 1600 500"
          fill="none"
        >
          <defs>
            <linearGradient id="waveA" x1="0" y1="0" x2="1600" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
              <stop offset="30%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#6366f1" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M -100 260 C 250 120, 480 400, 800 250 S 1350 90, 1700 280"
            stroke="url(#waveA)"
            strokeWidth="46"
            strokeLinecap="round"
            filter="blur(6px)"
          />
        </svg>
        <svg
          className={`absolute left-1/2 top-1/2 w-[160%] max-w-none -translate-x-1/2 -translate-y-1/2 ${shouldReduceMotion ? '' : 'animate-[wave-drift_28s_ease-in-out_infinite_reverse]'}`}
          style={{ mixBlendMode: 'screen', opacity: 0.1 + wavesOpacity * 0.4 }}
          viewBox="0 0 1600 500"
          fill="none"
        >
          <defs>
            <linearGradient id="waveB" x1="0" y1="0" x2="1600" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="45%" stopColor="#818cf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M -100 210 C 300 340, 600 120, 900 240 S 1400 380, 1700 200"
            stroke="url(#waveB)"
            strokeWidth="30"
            strokeLinecap="round"
            filter="blur(5px)"
          />
        </svg>
        <svg
          className={`absolute left-1/2 top-1/2 w-[160%] max-w-none -translate-x-1/2 -translate-y-1/2 ${shouldReduceMotion ? '' : 'animate-[wave-drift_17s_ease-in-out_infinite]'}`}
          style={{ mixBlendMode: 'screen', opacity: 0.08 + wavesOpacity * 0.3 }}
          viewBox="0 0 1600 500"
          fill="none"
        >
          <defs>
            <linearGradient id="waveC" x1="0" y1="0" x2="1600" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M -100 300 C 350 200, 650 340, 950 260 S 1450 160, 1700 320"
            stroke="url(#waveC)"
            strokeWidth="14"
            strokeLinecap="round"
            filter="blur(3px)"
          />
        </svg>

        {/* Stars / particles — distant dim layer for parallax depth */}
        {farStars.map((s, i) => (
          <span
            key={`far-${i}`}
            className={`absolute rounded-full bg-slate-400/40 w-px h-px ${shouldReduceMotion ? 'opacity-30' : 'animate-twinkle'}`}
            style={{ left: s.left, top: s.top, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
          />
        ))}

        {/* Stars / particles */}
        {stars.map((s, i) => (
          <span
            key={i}
            className={`absolute rounded-full bg-white ${shouldReduceMotion ? 'opacity-40' : 'animate-twinkle'}`}
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}

        {/* Perspective floor grid */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,179,237,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.35) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            transform: 'perspective(400px) rotateX(58deg)',
            transformOrigin: 'bottom',
            maskImage: 'linear-gradient(to top, black, transparent)',
            WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
            opacity: 0.18,
          }}
        />

        {/* Cinematic vignette */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 65% at 50% 45%, transparent 40%, rgba(0,0,0,0.55) 100%)' }}
        />

        {/* Subtle film grain for a premium, non-flat finish */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035]" style={{ mixBlendMode: 'overlay' }}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      {/* ---------- Center content ---------- */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Orb */}
        <div className="relative mb-6 w-[130px] h-[130px] sm:w-[160px] sm:h-[160px] md:w-[190px] md:h-[190px]">
          {/* Outer soft glow */}
          <motion.div
            className="absolute inset-[-24px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.35), rgba(168,85,247,0.15) 60%, transparent 75%)' }}
            animate={shouldReduceMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Faint outer orbit ellipse for depth */}
          <div
            className={`absolute inset-[-14px] rounded-full border border-white/10 ${shouldReduceMotion ? '' : 'animate-[spin_16s_linear_infinite]'}`}
            style={{ opacity: 0.35 * ringReveal, transform: 'rotate(-18deg)' }}
          />

          {/* Main neon ring */}
          <motion.svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 140 140"
            style={{ opacity: ringReveal }}
          >
            <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="3.5" />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="url(#orbRing)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={0}
              style={{ filter: `drop-shadow(0 0 ${ringGlow}px rgba(99,179,237,0.75))` }}
            />
            <defs>
              <linearGradient id="orbRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </motion.svg>

          {/* Secondary scanner ring — dashed, counter-rotating, HUD feel */}
          <svg
            className={`absolute inset-[6px] w-[calc(100%-12px)] h-[calc(100%-12px)] ${shouldReduceMotion ? '' : 'animate-[spin_11s_linear_infinite_reverse]'}`}
            viewBox="0 0 140 140"
            style={{ opacity: ringReveal * 0.6 }}
          >
            <circle
              cx="70"
              cy="70"
              r={radius - 10}
              fill="none"
              stroke="#67e8f9"
              strokeWidth="1"
              strokeDasharray="2 6"
              strokeLinecap="round"
              opacity={0.7}
            />
          </svg>

          {/* Orbiting particles */}
          <div
            className={`absolute inset-0 ${shouldReduceMotion ? '' : 'animate-[spin_6s_linear_infinite]'}`}
            style={{ opacity: ringReveal }}
          >
            <span
              className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-cyan-300"
              style={{ boxShadow: '0 0 14px 4px rgba(34,211,238,0.9)' }}
            />
          </div>
          <div
            className={`absolute inset-0 ${shouldReduceMotion ? '' : 'animate-[spin_9s_linear_infinite_reverse]'}`}
            style={{ opacity: ringReveal }}
          >
            <span
              className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-fuchsia-400"
              style={{ boxShadow: '0 0 16px 4px rgba(216,70,239,0.85)' }}
            />
          </div>

          {/* Glass tile with the real logo */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: logoReveal, scale: 0.75 + logoReveal * 0.25 }}
          >
            <motion.div
              className="w-[46%] h-[46%] rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_0_25px_rgba(56,189,248,0.15)] flex items-center justify-center overflow-hidden"
              animate={shouldReduceMotion ? undefined : { scale: [1, 1.06, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src="/logo.png" alt="Next Developer" className="w-[78%] h-[78%] object-contain rounded-lg" />
            </motion.div>
          </motion.div>
        </div>

        {/* Percentage */}
        <p
          className="font-mono font-bold tabular-nums tracking-wider mb-2 text-4xl sm:text-5xl bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent"
          style={{
            filter:
              'drop-shadow(0 0 10px rgba(34,211,238,0.5)) drop-shadow(0 0 24px rgba(192,132,252,0.35))',
          }}
        >
          {pct}%
        </p>

        {/* Brand */}
        <h1 className="text-lg sm:text-xl font-bold tracking-[0.3em] mb-3 text-white/90">
          NEXT DEVELOPER
        </h1>

        {/* Stage label */}
        <div className="h-4 mb-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-slate-400 tracking-widest font-medium"
            >
              {label}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="relative w-[240px] sm:w-[300px] md:w-[360px] h-1.5 rounded-full bg-white/5 border border-white/10 overflow-hidden mb-10">
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 overflow-hidden"
            style={{
              width: `${pct}%`,
              transition: 'width 0.15s linear',
              boxShadow: '0 0 12px rgba(99,179,237,0.7)',
            }}
          >
            {!shouldReduceMotion && (
              <span
                className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer-travel"
              />
            )}
          </div>
        </div>

        {/* Feature indicators */}
        <div className="flex flex-wrap items-start justify-center gap-x-5 gap-y-4 sm:gap-x-8 max-w-[320px] sm:max-w-none">
          {FEATURES.map((f) => {
            const visible = pct >= f.threshold;
            const Icon = f.icon;
            return (
              <AnimatePresence key={f.label}>
                {visible && (
                  <motion.div
                    className="flex flex-col items-center gap-1.5 w-14"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-shadow hover:shadow-[0_0_16px_rgba(99,179,237,0.4)]"
                      style={{ boxShadow: `0 0 14px ${f.color}22` }}
                    >
                      <Icon size={18} color={f.color} strokeWidth={2} />
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 text-center leading-tight tracking-wide">
                      {f.label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
