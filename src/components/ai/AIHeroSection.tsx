import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, Mic, Cpu, Zap } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { AnimatedStat } from '@/components/home/AnimatedStat';
import { usePublicStats } from '@/hooks/usePublicStats';
import { Users, Download, Star } from 'lucide-react';

/** Ported from codeninjavik's HeroSection — badge, gradient heading, glass "product panel" with floating chat bubbles. */
export function AIHeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  // Base figures + real numbers from the database, so these grow as real users and buyers arrive.
  const { stats: live, ready } = usePublicStats();
  const stats = [
    { icon: Users, label: 'Users', value: `${1200 + live.users}+` },
    { icon: Download, label: 'Downloads', value: `${5000 + live.sales}+` },
    { icon: Star, label: 'Rating', value: '4.8/5' },
  ];

  return (
    <section ref={sectionRef} className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: glowY }}
          animate={{ x: [0, 60, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[620px] h-[620px] rounded-full bg-primary/10 blur-[140px]"
        />
        <div className="absolute inset-0 particle-grid opacity-20" />
      </div>

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-primary/30 mb-7"
          >
            <Zap size={14} className="text-primary" />
            <span className="text-xs font-semibold text-primary/90 tracking-wide">Next-gen AI voice automation</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] mb-6"
          >
            <span className="text-foreground">Your PC, run entirely by</span>{' '}
            <span className="glow-text">voice</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto mb-9"
          >
            Automate daily tasks, control apps, and get things done hands-free with{' '}
            <span className="text-primary font-semibold">Jarvis</span> &amp;{' '}
            <span className="text-foreground font-semibold">Myra</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <a href="#ai-assistants">
              <GlowButton size="lg" className="group w-full sm:w-auto">
                <span>Buy Jarvis — ₹799</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </GlowButton>
            </a>
            <a href="#ai-assistants">
              <GlowButton variant="outline" size="lg" className="group w-full sm:w-auto">
                <span>Buy Myra — ₹799</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </GlowButton>
            </a>
          </motion.div>
        </div>

        {/* Full-width product panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative mt-16 md:mt-20 max-w-4xl mx-auto"
        >
          <div className="relative rounded-3xl glass-card p-8 md:p-12 overflow-hidden gradient-border">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent pointer-events-none" />

            <div className="relative flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary blur-2xl opacity-40" />
                <img
                  src="/logo.png"
                  alt="AI Assistant"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary/50 object-contain bg-background p-2 relative z-10"
                />
              </motion.div>

              <div className="flex flex-col gap-4 w-full max-w-xs">
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card"
                >
                  <span className="p-2 rounded-lg bg-primary/15 text-primary"><Mic size={18} /></span>
                  <span className="text-sm text-foreground/80">"Open Chrome and search for..."</span>
                </motion.div>
                <motion.div
                  animate={{ x: [0, -4, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card"
                >
                  <span className="p-2 rounded-lg bg-primary/15 text-primary"><Cpu size={18} /></span>
                  <span className="text-sm text-foreground/80">System command executed</span>
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border relative z-10">
              {stats.map((stat, i) => (
                <AnimatedStat key={`${i}-${ready}`} icon={stat.icon} value={stat.value} label={stat.label} delay={i * 200} />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
