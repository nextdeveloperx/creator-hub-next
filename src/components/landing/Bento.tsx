import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLandingReducedMotion } from '@/hooks/useLandingMotion';
import { ArrowUpRight, Check, Crown, Lock } from 'lucide-react';
import { useAIProducts } from '@/hooks/useAIProducts';
import { getIcon } from '@/lib/iconMap';

interface TileProps {
  to: string;
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
  className: string;
  index: number;
  children: React.ReactNode;
}

function Tile({ to, eyebrow, title, desc, cta, className, index, children }: TileProps) {
  const reduce = useLandingReducedMotion();
  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--tx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--ty', `${e.clientY - r.top}px`);
  };
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <Link to={to} onPointerMove={onMove} className="lp-glass lp-tile lp-card-link group h-full flex flex-col p-5 sm:p-6">
        {/* Visual */}
        <div className="relative z-10 h-52 sm:h-56 rounded-2xl border border-white/10 bg-black/25 overflow-hidden">
          {children}
        </div>

        {/* Copy */}
        <div className="relative z-10 mt-6 flex-1 flex flex-col">
          <p className="text-xs font-bold tracking-wide text-[hsl(var(--lp-cyan))]">{eyebrow}</p>
          <h3 className="lp-title mt-2">{title}</h3>
          <p className="mt-2 text-sm sm:text-[0.95rem] leading-relaxed text-muted-foreground max-w-[46ch]">{desc}</p>
          <span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-sm font-bold">
            {cta}
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ---------- Visuals ---------- */

const FALLBACK = [
  { name: 'Jarvis', sub: 'System assistant', from: '#06b6d4', to: '#0e7490' },
  { name: 'Myra 2.0', sub: 'Voice assistant', from: '#8b5cf6', to: '#a855f7' },
  { name: 'Ariya AI', sub: 'AI companion', from: '#f43f5e', to: '#e11d48' },
];

function AssistantsVisual() {
  const { products } = useAIProducts();
  const reduce = useLandingReducedMotion();
  const [active, setActive] = useState(0);

  const rows = products.length
    ? products.slice(0, 3).map((p) => ({ name: p.name, sub: p.subtitle, from: p.gradient_from, to: p.gradient_to, icon: getIcon(p.icon_name), logo: p.logo_url }))
    : FALLBACK.map((f) => ({ ...f, icon: getIcon('Bot'), logo: null as string | null }));

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % rows.length), 2200);
    return () => clearInterval(id);
  }, [reduce, rows.length]);

  return (
    <div className="absolute inset-0 p-4 flex flex-col justify-center gap-2.5">
      {rows.map((r, i) => {
        const Icon = r.icon;
        const on = i === active;
        return (
          <div
            key={r.name}
            className={`flex items-center gap-3.5 rounded-2xl border px-3.5 py-2.5 transition-all duration-500 ${
              on ? 'border-white/35 bg-white/10 scale-[1.02] shadow-lg' : 'border-white/10 bg-white/[0.03] opacity-70'
            }`}
          >
            {r.logo ? (
              <img src={r.logo} alt="" className="w-11 h-11 rounded-[22%] object-cover" />
            ) : (
              <span className="w-11 h-11 rounded-[22%] grid place-items-center shrink-0" style={{ background: `linear-gradient(135deg, ${r.from}, ${r.to})` }}>
                <Icon className="w-5 h-5 text-white" aria-hidden="true" />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-sm truncate">{r.name}</span>
              <span className="block text-xs text-muted-foreground truncate">{r.sub}</span>
            </span>
            <span className="flex items-end gap-[3px] h-4 shrink-0" aria-hidden="true">
              {[0, 1, 2, 3].map((b) => (
                <span
                  key={b}
                  className="lp-bar w-[3px] origin-bottom rounded-full bg-[hsl(var(--lp-cyan))]"
                  style={{ height: '100%', animationDelay: `${b * 0.13}s`, animationPlayState: on ? 'running' : 'paused', transform: on ? undefined : 'scaleY(0.25)' }}
                />
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TemplatesVisual() {
  return (
    <div className="absolute inset-0 p-4">
      <div className="h-full rounded-xl border border-white/10 bg-[hsl(234_40%_8%)] overflow-hidden flex flex-col">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10" aria-hidden="true">
          <i className="w-2 h-2 rounded-full bg-[#ff5f57]" /><i className="w-2 h-2 rounded-full bg-[#febc2e]" /><i className="w-2 h-2 rounded-full bg-[#28c840]" />
          <span className="ml-3 h-3.5 flex-1 rounded-full bg-white/[0.06]" />
        </div>
        <div className="flex-1 p-3 grid grid-cols-3 gap-2" aria-hidden="true">
          <motion.span className="col-span-3 rounded-lg" style={{ background: 'var(--lp-grad)', opacity: 0.85 }} animate={{ opacity: [0.6, 0.95, 0.6] }} transition={{ duration: 3, repeat: Infinity }} />
          {[0, 1, 2].map((i) => (
            <motion.span key={i} className="rounded-lg bg-white/10" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.35 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

const CODE = [
  { w: 'w-1/3', c: 'bg-violet-400/70', indent: 0 },
  { w: 'w-1/2', c: 'bg-cyan-300/70', indent: 1 },
  { w: 'w-2/5', c: 'bg-white/30', indent: 1 },
  { w: 'w-3/5', c: 'bg-pink-400/60', indent: 1 },
  { w: 'w-1/4', c: 'bg-violet-400/70', indent: 0 },
];

function CodeVisual() {
  return (
    <div className="absolute inset-0 p-5 font-mono" aria-hidden="true">
      <div className="space-y-2.5">
        {CODE.map((l, i) => (
          <motion.div
            key={i}
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: '100%', opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.25, duration: 0.5 }}
            className="flex items-center gap-3 overflow-hidden"
          >
            <span className="w-4 text-[10px] text-white/30 shrink-0">{i + 1}</span>
            <span className={`h-2.5 rounded-full ${l.w} ${l.c}`} style={{ marginLeft: l.indent * 18 }} />
          </motion.div>
        ))}
        <div className="flex items-center gap-3 pl-7"><span className="lp-caret" /></div>
      </div>
    </div>
  );
}

const LESSONS = ['Setup your project', 'Build the UI', 'Connect the database', 'Deploy live'];

function LearnVisual() {
  return (
    <div className="absolute inset-0 p-4 flex flex-col justify-center gap-2.5" aria-hidden="true">
      {LESSONS.map((l, i) => (
        <motion.div
          key={l}
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.15 }}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
        >
          <span
            className={`grid place-items-center w-5 h-5 rounded-full shrink-0 ${i < 3 ? 'text-[hsl(234_50%_5%)]' : 'border border-white/30'}`}
            style={i < 3 ? { background: 'hsl(var(--lp-cyan))' } : undefined}
          >
            {i < 3 && <Check className="w-3 h-3" strokeWidth={3} />}
          </span>
          <span className={`text-xs sm:text-sm ${i < 3 ? 'text-foreground/90' : 'text-muted-foreground'}`}>{l}</span>
        </motion.div>
      ))}
    </div>
  );
}

function MemberVisual() {
  return (
    <div className="absolute inset-0 p-4 flex flex-col justify-center gap-2.5" aria-hidden="true">
      <div className="flex items-center gap-2 mb-1">
        <Crown className="w-4 h-4 text-amber-300" />
        <span className="text-xs font-bold">Members only</span>
      </div>
      {['Pro Dashboard Template', 'Advanced React Patterns', 'Full-Stack SaaS Guide'].map((t, i) => (
        <motion.div
          key={t}
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: i * 0.5 }}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5"
        >
          <span className="flex-1 text-xs sm:text-sm truncate">{t}</span>
          <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </motion.div>
      ))}
    </div>
  );
}

export function Bento() {
  return (
    <section className="lp-section">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-12 gap-6 mb-14">
          <h2 className="lp-h2 lg:col-span-7">
            Everything a builder needs, <span className="lp-gradient-text">in one place</span>
          </h2>
          <p className="lp-lead text-muted-foreground lg:col-span-4 lg:col-start-9 self-end">
            Assistants that work for you, code that ships, and people who help when you are stuck.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          <Tile index={0} to="/ai" eyebrow="AI assistants" title="Talk to your computer" desc="Jarvis controls your PC by voice. Myra keeps you company. Buy once, own it for life." cta="See all assistants" className="lg:col-span-7">
            <AssistantsVisual />
          </Tile>
          <Tile index={1} to="/shop" eyebrow="Templates" title="Ship in days, not weeks" desc="Dashboards, landing pages and full apps you can deploy today." cta="Browse the shop" className="lg:col-span-5">
            <TemplatesVisual />
          </Tile>
          <Tile index={2} to="/services" eyebrow="Services" title="Built to your brief" desc="Websites, mobile apps and AI agents made by the team behind these products." cta="Start a project" className="lg:col-span-4">
            <CodeVisual />
          </Tile>
          <Tile index={3} to="/tutorials" eyebrow="Learn" title="Learn by building" desc="Real projects, step by step, from empty folder to live site." cta="Start learning" className="lg:col-span-4">
            <LearnVisual />
          </Tile>
          <Tile index={4} to="/membership" eyebrow="Membership" title="Get the inside track" desc="Members-only templates, early access and direct support." cta="Join membership" className="md:col-span-2 lg:col-span-4">
            <MemberVisual />
          </Tile>
        </div>
      </div>
    </section>
  );
}
