import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLandingReducedMotion } from '@/hooks/useLandingMotion';
import { MousePointerClick, CreditCard, Rocket } from 'lucide-react';

const STEPS = [
  { icon: MousePointerClick, title: 'Pick your assistant', desc: 'Open a listing, check the features and read what other buyers say.' },
  { icon: CreditCard, title: 'Pay once', desc: 'Secure Razorpay checkout. No subscription, no renewal surprises.' },
  { icon: Rocket, title: 'Start using it', desc: 'Get instant delivery, lifetime access and free updates.' },
];

/** The connecting line draws as the section scrolls through the viewport. */
export function Process() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useLandingReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 65%'] });
  const grow = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} className="lp-section">
      <div className="container mx-auto">
        <h2 className="lp-h2 max-w-[16ch] mb-16">From click to <span className="lp-gradient-text">running</span> in minutes</h2>

        <ol className="relative grid gap-12 md:grid-cols-3 md:gap-8">
          <span className="hidden md:block absolute top-8 left-0 right-0 h-px bg-white/15" aria-hidden="true" />
          <motion.span
            className="hidden md:block absolute top-8 left-0 right-0 h-[3px] -mt-px origin-left rounded-full"
            style={{ scaleX: reduce ? 1 : grow, background: 'var(--lp-grad)' }}
            aria-hidden="true"
          />
          <span className="md:hidden absolute top-0 bottom-0 left-8 w-px bg-white/15" aria-hidden="true" />
          <motion.span
            className="md:hidden absolute top-0 bottom-0 left-8 w-[3px] -ml-px origin-top rounded-full"
            style={{ scaleY: reduce ? 1 : grow, background: 'var(--lp-grad)' }}
            aria-hidden="true"
          />

          {STEPS.map((s, i) => (
            <li key={s.title} className="relative pl-24 md:pl-0 md:pt-24">
              <span className="lp-glass absolute left-0 top-0 grid place-items-center w-16 h-16 !rounded-2xl">
                <s.icon className="w-7 h-7 text-[hsl(var(--lp-cyan))]" aria-hidden="true" />
              </span>
              <span className="lp-title text-muted-foreground block mb-2">Step {i + 1}</span>
              <h3 className="lp-title !text-[clamp(1.4rem,2vw,2.1rem)] mb-3">{s.title}</h3>
              <p className="text-muted-foreground max-w-[36ch]">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
