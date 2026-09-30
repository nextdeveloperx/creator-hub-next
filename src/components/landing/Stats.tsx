import { Users, Package, Star, Bot } from 'lucide-react';
import { AnimatedStat } from '@/components/home/AnimatedStat';

const STATS = [
  { icon: Users, label: 'Supporters', value: '1.2K+' },
  { icon: Package, label: 'Products', value: '25+' },
  { icon: Star, label: 'Members', value: '500+' },
  { icon: Bot, label: 'AI assistants', value: '10+' },
];

export function Stats() {
  return (
    <section className="pb-6" aria-label="Community numbers">
      <div className="container mx-auto">
        <div className="lp-glass grid grid-cols-2 lg:grid-cols-4 gap-y-8 p-8 lg:p-10 divide-x-0 lg:divide-x divide-foreground/10">
          {STATS.map((s, i) => (
            <div key={s.label} className="lg:px-8 first:lg:pl-0 flex justify-center lg:justify-start">
              <AnimatedStat icon={s.icon} value={s.value} label={s.label} delay={i * 150} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
