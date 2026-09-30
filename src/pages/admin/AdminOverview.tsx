import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';
import { AdminStatsCards } from '@/components/admin/AdminStatsCards';
import { AdminCharts } from '@/components/admin/AdminCharts';
import { AdminExport } from '@/components/admin/AdminExport';
import { GlowButton } from '@/components/ui/GlowButton';
import { Receipt, MessageSquare, RefreshCw, Loader2 } from 'lucide-react';

export interface Purchase { id: string; product_name: string; amount: number; payment_status: string; created_at: string; user_id: string | null }
export interface Profile { id: string; full_name: string | null; email: string | null; created_at: string | null }
export interface Supporter { id: string; name: string; email: string | null; amount: number; message: string | null; is_monthly: boolean | null; created_at: string }
export interface Material { id: string; title: string; content_type: string; category: string | null; is_premium: boolean; price: number; download_count: number; rating: number; created_at: string }
export interface Inquiry { id: string; name: string; email: string; message: string; project_type: string | null; created_at: string }

/** Payment statuses that count as money received. */
const PAID = new Set(['paid', 'completed', 'success', 'captured']);
export const isPaid = (p: Purchase) => PAID.has((p.payment_status || '').toLowerCase());

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdminOverview() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [counts, setCounts] = useState({ aiProducts: 0, shopProducts: 0, releases: 0, subscribers: 0, members: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const head = (table: 'ai_products' | 'products' | 'app_releases' | 'newsletter_subscribers' | 'memberships') =>
      supabase.from(table).select('id', { count: 'exact', head: true });

    const results = await Promise.all([
      supabase.from('purchases').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, email, created_at'),
      supabase.from('supporters').select('*').order('created_at', { ascending: false }),
      supabase.from('materials').select('id, title, content_type, category, is_premium, price, download_count, rating, created_at').order('created_at', { ascending: false }),
      supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(50),
      head('ai_products'), head('products'), head('app_releases'), head('newsletter_subscribers'), head('memberships'),
    ]);
    const failed = results.find((r) => r.error);
    if (failed?.error) setError(failed.error.message);

    setPurchases((results[0].data as Purchase[]) || []);
    setProfiles((results[1].data as Profile[]) || []);
    setSupporters((results[2].data as Supporter[]) || []);
    setMaterials((results[3].data as Material[]) || []);
    setInquiries((results[4].data as Inquiry[]) || []);
    setCounts({
      aiProducts: results[5].count ?? 0,
      shopProducts: results[6].count ?? 0,
      releases: results[7].count ?? 0,
      subscribers: results[8].count ?? 0,
      members: results[9].count ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const paid = useMemo(() => purchases.filter(isPaid), [purchases]);
  const salesRevenue = paid.reduce((s, p) => s + (p.amount || 0), 0);
  const supportRevenue = supporters.reduce((s, x) => s + (x.amount || 0), 0);
  const profileById = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Sales, customers and content at a glance</p>
        </div>
        <GlowButton size="sm" variant="outline" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
        </GlowButton>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Some data could not be loaded: {error}
        </div>
      )}

      <AdminStatsCards
        loading={loading}
        stats={{
          revenue: salesRevenue + supportRevenue,
          sales: paid.length,
          customers: profiles.length,
          products: counts.aiProducts + counts.shopProducts + materials.length,
          subscribers: counts.subscribers,
          inquiries: inquiries.length,
        }}
        salesSpark={paid.slice(0, 8).map((p) => p.amount).reverse()}
      />

      <AdminExport purchases={purchases} profiles={profiles} supporters={supporters} materials={materials} />

      <AdminCharts
        purchases={paid}
        supporters={supporters}
        catalog={[
          { name: 'AI assistants', value: counts.aiProducts },
          { name: 'Shop products', value: counts.shopProducts },
          { name: 'Materials', value: materials.length },
          { name: 'App releases', value: counts.releases },
          { name: 'Members', value: counts.members },
        ]}
      />

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Recent Purchases</h2>
              <p className="text-xs text-muted-foreground">{purchases.length} total orders · {paid.length} paid</p>
            </div>
          </div>
          <ul className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {purchases.slice(0, 15).map((p) => {
              const buyer = p.user_id ? profileById.get(p.user_id) : undefined;
              return (
                <li key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/10">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{p.product_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {buyer?.full_name || buyer?.email || 'Customer'} · {fmtDate(p.created_at)}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${isPaid(p) ? 'bg-green-500/15 text-green-500' : 'bg-amber-500/15 text-amber-500'}`}>
                    {(p.payment_status || 'pending').toUpperCase()}
                  </span>
                  <span className="font-black tabular-nums shrink-0">₹{p.amount}</span>
                </li>
              );
            })}
            {purchases.length === 0 && !loading && (
              <li className="text-center py-10 text-sm text-muted-foreground">No purchases yet</li>
            )}
          </ul>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Recent Inquiries</h2>
              <p className="text-xs text-muted-foreground">{inquiries.length} from the services form</p>
            </div>
          </div>
          <ul className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {inquiries.slice(0, 15).map((q) => (
              <li key={q.id} className="p-3 rounded-xl border border-border/50 bg-muted/10">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-sm truncate">{q.name}</p>
                  <span className="text-xs text-muted-foreground shrink-0">{fmtDate(q.created_at)}</span>
                </div>
                <a href={`mailto:${q.email}`} className="text-xs text-primary hover:underline break-all">{q.email}</a>
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{q.message}</p>
              </li>
            ))}
            {inquiries.length === 0 && !loading && (
              <li className="text-center py-10 text-sm text-muted-foreground">No inquiries yet</li>
            )}
          </ul>
        </GlassCard>
      </div>

      {supporters.length > 0 && (
        <GlassCard className="mb-8">
          <h2 className="text-lg font-bold mb-1">Supporters</h2>
          <p className="text-xs text-muted-foreground mb-4">{supporters.length} total · ₹{supportRevenue}</p>
          <ul className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {supporters.slice(0, 15).map((s) => (
              <li key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/10">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{s.name}{s.is_monthly ? ' · monthly' : ''}</p>
                  {s.message && <p className="text-xs text-muted-foreground italic truncate">“{s.message}”</p>}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{fmtDate(s.created_at)}</span>
                <span className="font-black tabular-nums shrink-0">₹{s.amount}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}
    </motion.div>
  );
}
