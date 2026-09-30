import { useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';

interface Sale { product_name: string; amount: number; created_at: string }
interface Supporter { amount: number; created_at: string }
interface AdminChartsProps {
  /** Paid purchases only. */
  purchases: Sale[];
  supporters: Supporter[];
  catalog: { name: string; value: number }[];
}

const COLORS = ['#8b5cf6', '#06b6d4', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#a855f7', '#14b8a6'];

const tooltipStyle = {
  background: 'rgba(10,10,25,0.95)',
  border: '1px solid rgba(139,92,246,0.4)',
  borderRadius: 14,
  color: '#fff',
  padding: '10px 14px',
  fontSize: 13,
};

const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

export function AdminCharts({ purchases, supporters, catalog }: AdminChartsProps) {
  // Last 6 calendar months, zero-filled so the line never has gaps.
  const revenueByMonth = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { key: monthKey(d), name: d.toLocaleString('en-IN', { month: 'short' }), revenue: 0 };
    });
    const byKey = new Map(months.map((m) => [m.key, m]));
    [...purchases, ...supporters].forEach((row) => {
      const m = byKey.get(monthKey(new Date(row.created_at)));
      if (m) m.revenue += row.amount || 0;
    });
    return months;
  }, [purchases, supporters]);

  const hasRevenue = revenueByMonth.some((m) => m.revenue > 0);

  const byProduct = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; sales: number }>();
    purchases.forEach((p) => {
      const cur = map.get(p.product_name) || { name: p.product_name, revenue: 0, sales: 0 };
      cur.revenue += p.amount || 0;
      cur.sales += 1;
      map.set(p.product_name, cur);
    });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [purchases]);

  const top = byProduct.slice(0, 6);
  const catalogTotal = catalog.reduce((s, c) => s + c.value, 0);

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="h-full">
          <h3 className="text-lg font-bold mb-1">Revenue, last 6 months</h3>
          <p className="text-xs text-muted-foreground mb-4">Paid sales plus supporter contributions</p>
          {hasRevenue ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueByMonth} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fill="url(#revGrad)" dot={{ r: 4, fill: '#8b5cf6' }} animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">No paid sales yet</div>
          )}
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard className="h-full">
          <h3 className="text-lg font-bold mb-1">Top selling products</h3>
          <p className="text-xs text-muted-foreground mb-4">By revenue</p>
          {top.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={top} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 600 }} width={110} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, _n, item) => [`₹${v} · ${item.payload.sales} sold`, 'Revenue']} />
                <Bar dataKey="revenue" radius={[0, 8, 8, 0]} animationDuration={900}>
                  {top.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">No paid sales yet</div>
          )}
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <GlassCard className="h-full">
          <h3 className="text-lg font-bold mb-1">Sales share</h3>
          <p className="text-xs text-muted-foreground mb-4">Number of units sold per product</p>
          {byProduct.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byProduct} dataKey="sales" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={4} animationDuration={900}>
                  {byProduct.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(0,0,0,0.3)" />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [`${v} sold`, n]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">No paid sales yet</div>
          )}
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <GlassCard className="h-full">
          <h3 className="text-lg font-bold mb-1">Catalog overview</h3>
          <p className="text-xs text-muted-foreground mb-4">What is live on the site</p>
          {catalogTotal > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catalog} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={900}>
                  {catalog.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">Nothing published yet</div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
