import { Check, Loader2, Clock, Sparkles } from 'lucide-react';

const ITEMS = [
  { title: 'Premium templates', status: 'done', desc: 'Production-ready templates for modern web apps.' },
  { title: 'AI assistants', status: 'live', desc: 'Jarvis, Myra and more, with new ones on the way.' },
  { title: 'Community platform', status: 'soon', desc: 'Connect with other developers and share projects.' },
  { title: 'Courses and mentorship', status: 'planned', desc: 'Structured learning paths with personal guidance.' },
] as const;

const CFG = {
  done: { icon: Check, label: 'Shipped', tone: 'hsl(var(--lp-cyan))', spin: false },
  live: { icon: Loader2, label: 'Building now', tone: 'hsl(var(--lp-violet))', spin: true },
  soon: { icon: Clock, label: 'Coming soon', tone: 'hsl(var(--foreground))', spin: false },
  planned: { icon: Sparkles, label: 'Planned', tone: 'hsl(var(--muted-foreground))', spin: false },
};

export function Roadmap() {
  return (
    <section className="lp-section">
      <div className="container mx-auto">
        <h2 className="lp-h2 max-w-[14ch] mb-14">What is <span className="lp-gradient-text">coming next</span></h2>
        <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((it) => {
            const c = CFG[it.status];
            return (
              <li key={it.title} className="lp-glass p-6 flex flex-col gap-10 min-h-[15rem]">
                <span className="grid place-items-center w-11 h-11 rounded-full" style={{ background: c.tone, color: 'hsl(var(--background))' }}>
                  <c.icon className={`w-5 h-5 ${c.spin ? 'motion-safe:animate-spin' : ''}`} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold mb-1.5" style={{ color: it.status === 'planned' ? undefined : c.tone }}>{c.label}</p>
                  <h3 className="lp-title mb-2">{it.title}</h3>
                  <p className="text-sm text-muted-foreground">{it.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
