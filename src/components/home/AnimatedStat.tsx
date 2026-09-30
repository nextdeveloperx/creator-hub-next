import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';
import { LucideIcon } from 'lucide-react';

interface AnimatedStatProps {
  icon: LucideIcon;
  value: string;
  label: string;
  delay?: number;
}

export function AnimatedStat({ icon: Icon, value, label, delay = 0 }: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [enabled, setEnabled] = useState(false);

  const match = value.match(/^([\d.]+)(.*)$/);
  const numericValue = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : '';
  const hasDecimal = value.includes('.');

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setEnabled(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isInView, delay]);

  const displayValue = useCountUp({
    end: numericValue,
    duration: 2200,
    decimals: hasDecimal ? 1 : 0,
    suffix,
    enabled,
  });

  return (
    <div ref={ref} className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
      <div>
        <div className="nd-display text-2xl tabular-nums">{enabled ? displayValue : value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
