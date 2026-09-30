import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLandingReducedMotion } from '@/hooks/useLandingMotion';
import { ArrowLeft, ArrowRight, Quote, Star } from 'lucide-react';

const VOICES = [
  { name: 'Alex Chen', role: 'Frontend Developer', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', text: 'This platform helped me build real projects with confidence. The code quality is exceptional and I landed my first dev job within months.' },
  { name: 'Sarah Johnson', role: 'Full-Stack Engineer', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', text: 'The templates saved me weeks of work. Clean, modern, and exactly what I needed for my startup.' },
  { name: 'Mike Rivera', role: 'Junior Developer', avatar: 'https://randomuser.me/api/portraits/men/67.jpg', text: 'Best investment I made for my career. The real-world projects taught me more than any course.' },
  { name: 'Emma Wilson', role: 'UI/UX Designer', avatar: 'https://randomuser.me/api/portraits/women/63.jpg', text: "Love the attention to design details. These templates are not just functional, they're beautiful." },
];

const AUTOPLAY_MS = 6000;

/** One card on screen at a time (cheap to animate), with two ghost cards behind it for depth. */
export function Voices() {
  const reduce = useLandingReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [hovered, setHovered] = useState(false);

  const go = useCallback((next: number, d: number) => {
    setDir(d);
    setIndex((next + VOICES.length) % VOICES.length);
  }, []);

  useEffect(() => {
    if (reduce || hovered) return;
    const id = setTimeout(() => go(index + 1, 1), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, hovered, reduce, go]);

  const v = VOICES[index];

  return (
    <section className="lp-section">
      <div className="container mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-5">
          <h2 className="lp-h2 max-w-[12ch]">
            Loved by <span className="lp-gradient-text">developers</span>
          </h2>
          <p className="lp-lead mt-6 text-muted-foreground">Join hundreds of developers who are building better projects.</p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-3" aria-hidden="true">
              {VOICES.map((p) => (
                <img key={p.name} src={p.avatar} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-background" loading="lazy" />
              ))}
            </div>
            <div>
              <div className="flex gap-0.5" role="img" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />)}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">500+ members</p>
            </div>
          </div>
        </div>

        <div
          className="lg:col-span-7"
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
        >
          <div className="relative pb-8">
            {/* Ghost cards */}
            <div className="lp-glass absolute inset-x-6 top-5 bottom-0 opacity-50 !rounded-[2rem]" aria-hidden="true" />
            <div className="lp-glass absolute inset-x-12 top-9 -bottom-3 opacity-25 !rounded-[2rem]" aria-hidden="true" />

            <div className="lp-glass relative !rounded-[2rem] p-7 sm:p-10 min-h-[22rem] flex flex-col overflow-hidden">
              <Quote className="w-10 h-10 text-[hsl(var(--lp-cyan))] opacity-80 shrink-0" aria-hidden="true" />

              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.figure
                  key={index}
                  custom={dir}
                  initial={reduce ? false : { opacity: 0, x: dir * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: dir * -40 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 flex flex-col mt-5"
                >
                  <blockquote className="lp-title !font-semibold !text-[clamp(1.25rem,2.2vw,1.9rem)] !leading-[1.4]">
                    “{v.text}”
                  </blockquote>
                  <figcaption className="mt-auto pt-8 flex items-center gap-4">
                    <img src={v.avatar} alt="" className="w-14 h-14 rounded-full object-cover ring-2 ring-foreground/20" />
                    <span>
                      <span className="block font-bold">{v.name}</span>
                      <span className="block text-sm text-muted-foreground">{v.role}</span>
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-2" role="tablist" aria-label="Choose a testimonial">
              {VOICES.map((p, i) => (
                <button
                  key={p.name}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show review from ${p.name}`}
                  onClick={() => go(i, i > index ? 1 : -1)}
                  className="h-11 flex items-center px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--lp-cyan))] rounded-full"
                >
                  <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-10' : 'w-4 bg-foreground/25'}`} style={i === index ? { background: 'var(--lp-grad)' } : undefined} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => go(index - 1, -1)} aria-label="Previous review" className="w-11 h-11 grid place-items-center rounded-full border border-foreground/20 hover:bg-foreground/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--lp-cyan))]">
                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button onClick={() => go(index + 1, 1)} aria-label="Next review" className="w-11 h-11 grid place-items-center rounded-full border border-foreground/20 hover:bg-foreground/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--lp-cyan))]">
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
