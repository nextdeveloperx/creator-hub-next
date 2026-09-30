import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLandingReducedMotion } from '@/hooks/useLandingMotion';
import { Lock, Gift, Zap, Percent, MessageCircle, Crown, FileCode, Video, BookOpen, Palette } from 'lucide-react';

const BENEFITS = [
  { icon: Lock, title: 'Member-only templates', desc: 'Exclusive templates not available to free users.' },
  { icon: Gift, title: 'Private posts and updates', desc: 'Behind-the-scenes content and early announcements.' },
  { icon: Zap, title: 'Early access', desc: 'Try new releases and features first.' },
  { icon: Percent, title: 'Product discounts', desc: 'Special pricing on all digital products.' },
  { icon: MessageCircle, title: 'Direct creator support', desc: 'Priority help and direct communication.' },
];

const LOCKED = [
  { icon: FileCode, title: 'Pro Dashboard Template', type: 'Template', tag: 'New' },
  { icon: Video, title: 'Advanced React Patterns', type: 'Video course', tag: 'Popular' },
  { icon: BookOpen, title: 'Full-Stack SaaS Guide', type: 'E-book', tag: 'Exclusive' },
  { icon: Palette, title: 'UI Component Library', type: 'Resource pack', tag: 'Premium' },
];

export function Membership() {
  const reduce = useLandingReducedMotion();
  return (
    <section className="lp-section">
      <div className="container mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-6">
          <h2 className="lp-h2">Unlock <span className="lp-gradient-text">full access</span></h2>
          <p className="lp-lead mt-6 text-muted-foreground">Join the membership for exclusive content, early access and direct support.</p>

          <ul className="mt-10 border-t border-border">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex items-center gap-4 py-5 border-b border-border">
                <span className="grid place-items-center w-12 h-12 rounded-xl shrink-0" style={{ background: 'var(--lp-grad)' }}>
                  <b.icon className="w-5 h-5 text-white" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link to="/membership" className="lp-btn lp-btn-primary mt-10">
            <Crown className="w-5 h-5" aria-hidden="true" />
            Join membership
          </Link>
        </div>

        <div className="lg:col-span-6">
          <div className="lp-glass relative p-6 sm:p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <span className="flex items-center gap-2 font-bold text-lg">
                <Crown className="w-6 h-6 text-[hsl(var(--lp-cyan))]" aria-hidden="true" />
                Premium content
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-foreground/10 text-foreground">{LOCKED.length} items locked</span>
            </div>

            <ul className="space-y-3">
              {LOCKED.map((item, i) => (
                <motion.li
                  key={item.title}
                  initial={reduce ? false : { opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-foreground/5 border border-foreground/10"
                >
                  <span className="w-12 h-12 rounded-xl bg-foreground/10 grid place-items-center shrink-0">
                    <item.icon className="w-5 h-5 text-[hsl(var(--lp-cyan))]" aria-hidden="true" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.type} · {item.tag}</p>
                  </div>
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
