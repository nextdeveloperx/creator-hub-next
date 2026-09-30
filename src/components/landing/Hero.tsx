import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLandingReducedMotion } from '@/hooks/useLandingMotion';
import { Bot, Package, Mic, Check } from 'lucide-react';
import type { CorePhase } from './VoiceCore';

// three.js is heavy and not needed for first paint, so the orb loads after the text is on screen.
const VoiceCore = lazy(() => import('./VoiceCore'));

const WORDS = ['Next', 'Developer'];

/** Real things Jarvis/Myra do, shown as the orb "speaks". */
const COMMANDS = [
  { say: "Open Chrome and search today's weather", done: 'Chrome opened with the weather' },
  { say: 'Send WhatsApp to Rahul: running 10 minutes late', done: 'WhatsApp message sent' },
  { say: 'Set volume to 40 percent', done: 'Volume set to 40%' },
  { say: 'Fix my failing build', done: 'Build fixed and passing' },
];

/** CSS stand-in shown while WebGL loads, and permanently if it is unavailable. */
function OrbFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center [perspective:900px]" aria-hidden="true">
      <div className="lp-orbit absolute h-[70%] w-[70%] rounded-full border border-[hsl(var(--lp-violet)/0.35)] [transform-style:preserve-3d]" />
      <div className="lp-breathe h-[46%] w-[46%] rounded-full bg-[radial-gradient(circle_at_40%_35%,#a78bfa,#4c1d95_55%,#0b0420_80%)] shadow-[0_0_120px_20px_hsl(262_92%_60%/0.4)]" />
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  return (
    <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="lp-bar w-[3px] origin-bottom rounded-full bg-[hsl(var(--lp-cyan))]"
          style={{ height: '100%', animationDelay: `${i * 0.12}s`, animationPlayState: active ? 'running' : 'paused', transform: active ? undefined : 'scaleY(0.3)' }}
        />
      ))}
    </span>
  );
}

export function Hero() {
  const reduce = useLandingReducedMotion();
  const [phase, setPhase] = useState<CorePhase>('listening');
  const [cycle, setCycle] = useState(0);
  const [webglFailed, setWebglFailed] = useState(false);

  const command = COMMANDS[(Math.max(cycle, 1) - 1) % COMMANDS.length];
  const showCommand = cycle > 0;

  return (
    <section className="relative pt-16 lg:pt-20 pb-20 lg:pb-28 min-h-[calc(100svh-4rem)] flex items-center">
      <div className="container mx-auto relative z-10 grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
        <div className="text-center lg:text-left">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lp-glass !rounded-full inline-flex items-center gap-2.5 px-5 py-2 text-sm text-muted-foreground"
          >
            <span className="lp-live w-2 h-2 rounded-full" style={{ background: 'hsl(var(--lp-cyan))' }} aria-hidden="true" />
            AI assistants, templates and services
          </motion.p>

          <h1 className="lp-display mt-7 text-[clamp(2.9rem,7.2vw,6.75rem)]" aria-label="Next Developer">
            {WORDS.map((w, i) => (
              <span key={w} className="block overflow-hidden pb-[0.1em]" aria-hidden="true">
                <motion.span
                  className={`block ${i === 1 ? 'lp-gradient-text lp-shine' : ''}`}
                  initial={reduce ? false : { y: '115%', rotate: 4 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{ duration: 1.05, delay: 0.15 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="lp-lead mt-7 mx-auto lg:mx-0 text-muted-foreground"
          >
            Voice-controlled assistants, production-ready code and a community of builders. Pay once, use it for life.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="mt-9 flex flex-wrap items-center justify-center lg:justify-start gap-3"
          >
            <Link to="/ai" className="lp-btn lp-btn-primary">
              <Bot className="w-5 h-5" aria-hidden="true" />
              Explore AI assistants
            </Link>
            <Link to="/shop" className="lp-btn lp-btn-ghost">
              <Package className="w-5 h-5" aria-hidden="true" />
              Browse the shop
            </Link>
          </motion.div>
        </div>

        {/* 3D voice orb with live command bubbles */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto aspect-square w-full max-w-[540px]"
        >
          <OrbFallback />
          {!webglFailed && (
            <Suspense fallback={null}>
              <VoiceCore
                className="absolute inset-0"
                onUnsupported={() => setWebglFailed(true)}
                onPhase={(p, c) => {
                  setPhase(p);
                  setCycle(c);
                }}
              />
            </Suspense>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-[6%] flex flex-col items-center gap-2 px-4" aria-live="polite">
            <AnimatePresence mode="popLayout">
              {showCommand && (
                <motion.div
                  key={`say-${cycle}`}
                  initial={{ opacity: 0, y: 14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="lp-glass !rounded-2xl flex max-w-full items-center gap-3 px-4 py-2.5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--lp-violet)/0.25)] text-primary">
                    <Mic size={14} aria-hidden="true" />
                  </span>
                  <span className="truncate text-sm text-foreground/90">&ldquo;{command.say}&rdquo;</span>
                  <Waveform active={phase === 'speaking'} />
                </motion.div>
              )}
              {showCommand && phase === 'listening' && (
                <motion.div
                  key={`done-${cycle}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-sm text-emerald-700 dark:text-emerald-300 backdrop-blur-md"
                >
                  <Check size={14} aria-hidden="true" /> {command.done}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
