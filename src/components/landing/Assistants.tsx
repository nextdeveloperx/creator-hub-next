import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLandingReducedMotion } from '@/hooks/useLandingMotion';
import { Star, ArrowRight } from 'lucide-react';
import { useAIProducts, type AIProductRow } from '@/hooks/useAIProducts';
import { getIcon } from '@/lib/iconMap';
import { getBaseMeta } from '@/lib/aiStoreMeta';

function ProductCard({ p }: { p: AIProductRow }) {
  const Icon = getIcon(p.icon_name);
  const meta = getBaseMeta(p.slug, p.name);
  const grad = `linear-gradient(135deg, ${p.gradient_from}, ${p.gradient_to})`;
  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--tx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--ty', `${e.clientY - r.top}px`);
  };
  return (
    <Link to={`/ai/${p.slug}`} onPointerMove={onMove} className="lp-glass lp-tile lp-card-link flex flex-col w-[18.5rem] sm:w-[22rem] h-[27rem] p-7 shrink-0">
      <div className="relative z-10 flex items-center gap-4">
        {p.logo_url ? (
          <img src={p.logo_url} alt="" className="w-[4.75rem] h-[4.75rem] rounded-[22%] object-cover" loading="lazy" />
        ) : (
          <span className="w-[4.75rem] h-[4.75rem] rounded-[22%] grid place-items-center shrink-0" style={{ background: grad }}>
            <Icon className="w-9 h-9 text-white" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="lp-title truncate">{p.name}</h3>
          <p className="text-sm text-muted-foreground capitalize">{p.category}</p>
        </div>
      </div>

      <p className="relative z-10 mt-6 text-muted-foreground leading-relaxed line-clamp-3">{p.subtitle}</p>

      <ul className="relative z-10 mt-5 space-y-2 text-sm text-foreground/80">
        {p.features.slice(0, 3).map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.gradient_to }} aria-hidden="true" />
            <span className="line-clamp-1">{f}</span>
          </li>
        ))}
      </ul>

      <div className="relative z-10 mt-auto flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
          {meta.rating.toFixed(1)}
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span className="sr-only">rating</span>
        </span>
        <span className="rounded-full px-5 py-2.5 text-sm font-bold text-white" style={{ background: grad }}>
          {p.is_coming_soon ? 'Coming soon' : `₹${p.price}`}
        </span>
      </div>
    </Link>
  );
}

/** Desktop: the section pins while the row of cards slides sideways with vertical scroll. Mobile: a normal swipe rail. */
export function Assistants() {
  const { products, loading } = useAIProducts();
  const reduce = useLandingReducedMotion();
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -shift]);

  useEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setShift(Math.max(0, track.current.scrollWidth - window.innerWidth + 80));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [products.length]);

  const pinned = !reduce && shift > 0;

  const header = (
    <div className="container mx-auto flex flex-wrap items-end justify-between gap-6 mb-12">
      <h2 className="lp-h2 max-w-[14ch]">Meet the <span className="lp-gradient-text">assistants</span></h2>
      <Link to="/ai" className="lp-btn lp-btn-ghost lp-card-link">
        See all
        <ArrowRight className="w-5 h-5" aria-hidden="true" />
      </Link>
    </div>
  );

  if (loading || products.length === 0) {
    return (
      <section className="lp-section">
        {header}
        <div className="container mx-auto flex gap-5 overflow-hidden">
          {loading
            ? [0, 1, 2].map((i) => <div key={i} className="lp-glass w-[22rem] h-[27rem] shrink-0 animate-pulse" aria-hidden="true" />)
            : <p className="text-muted-foreground">New assistants are on the way. Check back soon.</p>}
        </div>
      </section>
    );
  }

  return (
    <section ref={outer} className="relative" style={pinned ? { height: `calc(100vh + ${shift}px)` } : undefined}>
      <div className={pinned ? 'sticky top-0 h-screen flex flex-col justify-center overflow-hidden' : 'lp-section'}>
        {header}
        <motion.div
          ref={track}
          style={pinned ? { x } : undefined}
          className={pinned ? 'flex gap-6 pl-[max(1.25rem,calc((100vw-1600px)/2+5rem))] pr-20 w-max' : 'lp-rail px-5'}
          role="list"
        >
          {products.map((p) => (
            <div key={p.id} role="listitem" className="shrink-0">
              <ProductCard p={p} />
            </div>
          ))}
        </motion.div>
        {pinned && (
          <div className="container mx-auto mt-10" aria-hidden="true">
            <div className="h-1 rounded-full bg-foreground/10 overflow-hidden">
              <motion.div className="h-full origin-left rounded-full" style={{ scaleX: scrollYProgress, background: 'var(--lp-grad)' }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
