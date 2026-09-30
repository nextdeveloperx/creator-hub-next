import { useEffect, useState } from 'react';
import { IndianRupee, ShoppingCart, Users, Package, Mail, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface Stats {
  revenue: number;
  sales: number;
  customers: number;
  products: number;
  subscribers: number;
  inquiries: number;
}

interface AdminStatsCardsProps {
  stats: Stats;
  loading?: boolean;
  /** Recent sale amounts, oldest first, for the revenue sparkline. */
  salesSpark?: number[];
}

function Counter({ target, prefix = '' }: { target: number; prefix?: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return <span>{prefix}{value.toLocaleString('en-IN')}</span>;
}

const CARDS = [
  { key: 'revenue', label: 'Revenue', icon: IndianRupee, prefix: '₹', color: '#f59e0b', tone: 'from-yellow-500/20 via-amber-600/10 to-orange-500/20 border-yellow-500/30', iconTone: 'bg-yellow-500/10 text-yellow-400' },
  { key: 'sales', label: 'Paid sales', icon: ShoppingCart, prefix: '', color: '#10b981', tone: 'from-green-500/20 via-emerald-600/10 to-teal-500/20 border-green-500/30', iconTone: 'bg-green-500/10 text-green-400' },
  { key: 'customers', label: 'Customers', icon: Users, prefix: '', color: '#3b82f6', tone: 'from-blue-500/20 via-blue-600/10 to-cyan-500/20 border-blue-500/30', iconTone: 'bg-blue-500/10 text-blue-400' },
  { key: 'products', label: 'Products', icon: Package, prefix: '', color: '#a855f7', tone: 'from-purple-500/20 via-violet-600/10 to-fuchsia-500/20 border-purple-500/30', iconTone: 'bg-purple-500/10 text-purple-400' },
  { key: 'subscribers', label: 'Subscribers', icon: Mail, prefix: '', color: '#ec4899', tone: 'from-pink-500/20 via-rose-600/10 to-fuchsia-500/20 border-pink-500/30', iconTone: 'bg-pink-500/10 text-pink-400' },
  { key: 'inquiries', label: 'Inquiries', icon: MessageSquare, prefix: '', color: '#06b6d4', tone: 'from-cyan-500/20 via-sky-600/10 to-blue-500/20 border-cyan-500/30', iconTone: 'bg-cyan-500/10 text-cyan-400' },
] as const;

export function AdminStatsCards({ stats, loading = false, salesSpark = [] }: AdminStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {CARDS.map((c, i) => (
        <motion.div
          key={c.key}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${c.tone} p-4 shadow-lg`}
        >
          <div className={`w-9 h-9 rounded-xl ${c.iconTone} flex items-center justify-center mb-3`}>
            <c.icon className="w-4 h-4" aria-hidden="true" />
          </div>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">{c.label}</p>
          <p className="text-2xl font-black mt-1 tabular-nums">
            {loading ? <span className="inline-block w-12 h-6 rounded bg-muted animate-pulse" /> : <Counter target={stats[c.key]} prefix={c.prefix} />}
          </p>
          {c.key === 'revenue' && salesSpark.length > 1 && (
            <div className="absolute bottom-0 right-0 w-20 h-10 opacity-40" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesSpark.map((v, idx) => ({ v, idx }))}>
                  <Line type="monotone" dataKey="v" stroke={c.color} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
