import { Link } from 'react-router-dom';
import { Heart, Target, Lightbulb, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLandingReducedMotion } from '@/hooks/useLandingMotion';
import creatorProfile from '@/assets/creator-profile.png';

const PILLARS = [
  { icon: Target, title: 'Quality first', desc: 'Every template is production-ready.' },
  { icon: Lightbulb, title: 'Clarity always', desc: 'Clean code that makes sense.' },
  { icon: Heart, title: 'Real-world skills', desc: 'Build what matters.' },
];

export function Story() {
  const reduce = useLandingReducedMotion();
  return (
    <section className="lp-section">
      <div className="container mx-auto">
        <div className="lp-glass !rounded-[2.25rem] p-6 sm:p-10 lg:p-14 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center overflow-hidden">
          {/* Portrait with a slowly turning gradient ring */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 flex justify-center"
          >
            <div className="relative w-64 sm:w-72 aspect-square">
              <div
                className="lp-ring absolute -inset-[5px] rounded-full"
                style={{ background: 'conic-gradient(from 0deg, hsl(262 92% 66%), hsl(188 95% 58%), hsl(322 90% 66%), hsl(262 92% 66%))' }}
                aria-hidden="true"
              />
              <div className="absolute -inset-10 rounded-full blur-3xl opacity-30" style={{ background: 'var(--lp-grad)' }} aria-hidden="true" />
              <img
                src={creatorProfile}
                alt="Creator of Next Developer"
                className="relative w-full h-full rounded-full object-cover bg-[hsl(234_40%_10%)] border-4 border-[hsl(234_50%_5%)]"
                loading="lazy"
              />
              <motion.span
                animate={reduce ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="lp-glass !rounded-full absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 text-xs font-bold"
              >
                Full-Stack Developer &amp; Creator
              </motion.span>
            </div>
          </motion.div>

          <div className="lg:col-span-8">
            <h2 className="lp-h2 !text-[clamp(1.9rem,3.6vw,3.4rem)]">
              Why I built <span className="lp-gradient-text">Next Developer</span>
            </h2>

            <blockquote className="mt-7 border-l-2 pl-5 text-lg sm:text-xl leading-relaxed text-foreground/90" style={{ borderColor: 'hsl(var(--lp-cyan))' }}>
              When I started learning to code, I struggled to find resources that showed how to build{' '}
              <span className="font-bold text-foreground">real, production-ready projects</span>. Most tutorials stopped at the basics, leaving a huge gap between learning and shipping.
            </blockquote>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-[60ch]">
              So I created a place for developers to <span className="font-semibold text-foreground">learn by building</span>. Every template, project and assistant is made to give you skills you can use immediately.
            </p>

            <ul className="grid sm:grid-cols-3 gap-3 mt-9">
              {PILLARS.map((p) => (
                <li key={p.title} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex sm:flex-col items-center sm:items-start gap-4 sm:gap-3 transition-colors hover:border-white/25 hover:bg-white/[0.07]">
                  <span className="grid place-items-center w-11 h-11 rounded-xl shrink-0 transition-transform duration-300 group-hover:-rotate-6" style={{ background: 'var(--lp-grad)' }}>
                    <p.icon className="w-5 h-5 text-white" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-bold">{p.title}</span>
                    <span className="block text-sm text-muted-foreground mt-0.5">{p.desc}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/tutorials" className="lp-btn lp-btn-primary">
                <BookOpen className="w-5 h-5" aria-hidden="true" />
                Start learning
              </Link>
              <Link to="/support" className="lp-btn lp-btn-ghost lp-card-link">
                Support the work
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
