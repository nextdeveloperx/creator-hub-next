import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationFrame, useInView, useMotionValue, useScroll, useSpring, useVelocity } from 'framer-motion';
import { useLandingReducedMotion } from '@/hooks/useLandingMotion';

interface Tech {
  name: string;
  slug: string; // simple-icons slug
  color: string; // brand colour (hex, no #)
}

const ROW_A: Tech[] = [
  { name: 'HTML', slug: 'html5', color: 'E34F26' },
  { name: 'CSS', slug: 'css', color: '1572B6' },
  { name: 'JavaScript', slug: 'javascript', color: 'F7DF1E' },
  { name: 'TypeScript', slug: 'typescript', color: '3178C6' },
  { name: 'React', slug: 'react', color: '61DAFB' },
  { name: 'Next.js', slug: 'nextdotjs', color: 'FFFFFF' },
  { name: 'Tailwind', slug: 'tailwindcss', color: '06B6D4' },
  { name: 'Node.js', slug: 'nodedotjs', color: '5FA04E' },
];

const ROW_B: Tech[] = [
  { name: 'Express.js', slug: 'express', color: 'FFFFFF' },
  { name: 'Python', slug: 'python', color: '3776AB' },
  { name: 'MongoDB', slug: 'mongodb', color: '47A248' },
  { name: 'PostgreSQL', slug: 'postgresql', color: '4169E1' },
  { name: 'Firebase', slug: 'firebase', color: 'FFCA28' },
  { name: 'Supabase', slug: 'supabase', color: '3ECF8E' },
  { name: 'GitHub', slug: 'github', color: 'FFFFFF' },
  { name: 'OpenAI', slug: 'openai', color: 'FFFFFF' },
];

function Chip({ t }: { t: Tech }) {
  const [broken, setBroken] = useState(false);
  return (
    <li
      className="lp-glass lp-chip group flex items-center gap-3.5 !rounded-2xl pl-3.5 pr-6 py-3 whitespace-nowrap select-none"
      style={{ ['--chip' as string]: `#${t.color}` }}
    >
      <span className="grid place-items-center w-11 h-11 rounded-xl bg-foreground/[0.06] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]">
        {broken ? (
          <span className="font-bold text-lg" style={{ color: `#${t.color}` }}>{t.name[0]}</span>
        ) : (
          <img
            src={`https://cdn.simpleicons.org/${t.slug}/${t.color}`}
            alt=""
            width={24}
            height={24}
            loading="lazy"
            onError={() => setBroken(true)}
            className="w-6 h-6"
          />
        )}
      </span>
      <span className="lp-title !text-[1.1rem] text-foreground/90 group-hover:text-foreground transition-colors">{t.name}</span>
    </li>
  );
}

/**
 * JS-driven loop: keeps sliding, speeds up while the page is being scrolled, and pauses on hover.
 * With reduced motion it still drifts, but at a third of the speed.
 */
function Row({ items, reverse, speed }: { items: Tech[]; reverse?: boolean; speed: number }) {
  const reduce = useLandingReducedMotion();
  const track = useRef<HTMLUListElement>(null);
  const x = useMotionValue(0);
  const half = useRef(0);
  const wrap = useRef<HTMLDivElement>(null);
  const visible = useInView(wrap);
  const paused = useRef(false);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const boost = useSpring(velocity, { stiffness: 60, damping: 25 });

  useEffect(() => {
    const measure = () => {
      if (track.current) half.current = track.current.scrollWidth / 2;
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const last = useRef(0);

  useAnimationFrame((time) => {
    // framer clamps its own delta to ~40ms; measuring from the timestamp keeps the speed steady on slow frames.
    const dt = last.current ? Math.min((time - last.current) / 1000, 0.25) : 0;
    last.current = time;
    if (paused.current || !visible || !half.current) return;
    const dir = reverse ? 1 : -1;
    const base = reduce ? speed / 3 : speed;
    const extra = reduce ? 0 : Math.min(Math.abs(boost.get()) / 6, 400);
    let next = x.get() + dir * (base + extra) * dt;
    if (next <= -half.current) next += half.current;
    if (next > 0) next -= half.current;
    x.set(next);
  });

  return (
    <div
      ref={wrap}
      className="overflow-hidden py-2"
      onPointerEnter={() => { paused.current = true; }}
      onPointerLeave={() => { paused.current = false; }}
    >
      <motion.ul ref={track} style={{ x }} className="flex w-max gap-4 pr-4 will-change-transform">
        {[0, 1].map((h) =>
          items.map((t) => (
            <span key={`${h}-${t.name}`} aria-hidden={h === 1 || undefined} className="contents">
              <Chip t={t} />
            </span>
          )),
        )}
      </motion.ul>
    </div>
  );
}

export function TechMarquee() {
  return (
    <section aria-label="Technologies we build with" className="py-14 overflow-hidden">
      <p className="text-center text-sm font-semibold tracking-wide text-muted-foreground mb-8">
        Built with the tools professionals use every day
      </p>
      <div className="lp-fade space-y-3">
        <Row items={ROW_A} speed={90} />
        <Row items={ROW_B} reverse speed={75} />
      </div>
    </section>
  );
}
