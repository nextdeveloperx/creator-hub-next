import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, UploadCloud, Loader2, Pencil, Trash2, Megaphone } from 'lucide-react';
import type { Promotion } from '@/hooks/useActivePromotion';
import type { AIProductRow } from '@/hooks/useAIProducts';

interface FormState {
  title: string;
  message: string;
  banner_url: string;
  scope: 'global' | 'ai_products';
  discount_type: 'percentage' | 'flat';
  discount_value: string;
  product_ids: string[];
  is_active: boolean;
  starts_at: string;
  ends_at: string;
}

const EMPTY: FormState = {
  title: '', message: '', banner_url: '', scope: 'global', discount_type: 'percentage',
  discount_value: '', product_ids: [], is_active: false, starts_at: '', ends_at: '',
};

const toDatetimeLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');

export function AdminPromotionsSection() {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<AIProductRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAll = useCallback(async () => {
    const [{ data: promos }, { data: prods }] = await Promise.all([
      supabase.from('promotions').select('*').order('created_at', { ascending: false }),
      supabase.from('ai_products').select('*').order('display_order', { ascending: true }),
    ]);
    if (promos) setPromotions(promos as Promotion[]);
    if (prods) setProducts(prods as AIProductRow[]);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const resetForm = () => { setForm(EMPTY); setEditingId(null); setShowForm(false); };

  const startEdit = (p: Promotion) => {
    setForm({
      title: p.title, message: p.message || '', banner_url: p.banner_url || '',
      scope: p.scope, discount_type: p.discount_type, discount_value: String(p.discount_value),
      product_ids: p.product_ids || [], is_active: p.is_active,
      starts_at: toDatetimeLocal(p.starts_at), ends_at: toDatetimeLocal(p.ends_at),
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleBannerUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `promo-banners/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('ai-product-media').upload(path, file);
      if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); return; }
      const { publicUrl } = supabase.storage.from('ai-product-media').getPublicUrl(path).data;
      set('banner_url', publicUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast({ title: 'Title is required', variant: 'destructive' }); return; }
    if (!form.discount_value || Number(form.discount_value) < 0) { toast({ title: 'Valid discount value is required (0 for banner-only)', variant: 'destructive' }); return; }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim() || null,
        banner_url: form.banner_url || null,
        scope: form.scope,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value) || 0,
        product_ids: form.scope === 'ai_products' ? form.product_ids : [],
        is_active: form.is_active,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      };

      const { error } = editingId
        ? await supabase.from('promotions').update(payload).eq('id', editingId)
        : await supabase.from('promotions').insert(payload);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: editingId ? 'Promotion updated!' : 'Promotion created!' });
        resetForm();
        fetchAll();
      }
    } finally {
      setSaving(false);
    }
  };

  const deletePromotion = async (id: string) => {
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    else { toast({ title: 'Promotion deleted' }); fetchAll(); }
  };

  const togglePublished = async (p: Promotion) => {
    const { error } = await supabase.from('promotions').update({ is_active: !p.is_active }).eq('id', p.id);
    if (!error) fetchAll();
  };

  return (
    <GlassCard>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">Promotions & Offers</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Run a site-wide event banner + discount, or put a specific AI product "on offer" — it gets pinned to the top of every AI grid with an animated OFFER badge. Only one should be active at a time.
          </p>
        </div>
        <GlowButton size="sm" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
          {showForm ? <><X className="w-4 h-4" /> Close</> : <><Plus className="w-4 h-4" /> Add Promotion</>}
        </GlowButton>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border border-border rounded-lg bg-muted/20 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="Diwali Sale" value={form.title} onChange={(e) => set('title', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Scope</Label>
              <Select value={form.scope} onValueChange={(v) => set('scope', v as FormState['scope'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (entire site)</SelectItem>
                  <SelectItem value="ai_products">AI Products only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Banner Message (optional)</Label>
            <Textarea placeholder="Flat 20% off everything this weekend!" value={form.message} onChange={(e) => set('message', e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Banner Image (optional)</Label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleBannerUpload(e.target.files[0])} />
            {form.banner_url ? (
              <div className="flex items-center gap-3">
                <img src={form.banner_url} alt="Banner" className="w-24 h-12 rounded-lg object-cover border border-border" />
                <button type="button" onClick={() => set('banner_url', '')} className="p-1.5 rounded-md hover:bg-muted"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-lg p-5 cursor-pointer text-center text-sm text-muted-foreground hover:border-primary/50 transition-colors">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><UploadCloud className="w-5 h-5 mx-auto mb-1" />Upload event banner</>}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select value={form.discount_type} onValueChange={(v) => set('discount_type', v as FormState['discount_type'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="flat">Flat (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discount Value *</Label>
              <Input type="number" min={0} placeholder={form.discount_type === 'percentage' ? '20' : '100'} value={form.discount_value} onChange={(e) => set('discount_value', e.target.value)} />
            </div>
          </div>

          {form.scope === 'ai_products' && (
            <div className="space-y-2">
              <Label>Which AI product gets this offer?</Label>
              <Select
                value={form.product_ids[0] ?? 'all'}
                onValueChange={(v) => set('product_ids', v === 'all' ? [] : [v])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All AI Products</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Starts At (optional)</Label>
              <Input type="datetime-local" value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ends At (optional)</Label>
              <Input type="datetime-local" value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={form.is_active} onCheckedChange={(v) => set('is_active', v)} />
            <Label>Active (live on the site right now)</Label>
          </div>

          <div className="flex gap-3 pt-2">
            <GlowButton onClick={handleSubmit} className="flex-1" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Promotion' : 'Create Promotion'}
            </GlowButton>
            {editingId && <GlowButton variant="outline" onClick={resetForm}>Cancel</GlowButton>}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {promotions.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">
                {p.title} <span className="text-muted-foreground font-normal">{p.discount_value}{p.discount_type === 'percentage' ? '%' : '₹'} off</span>
              </p>
              <p className="text-xs text-muted-foreground truncate">{p.scope === 'global' ? 'Site-wide' : 'AI products'}{p.product_ids?.length ? ` (${p.product_ids.length} selected)` : ''}</p>
            </div>
            <button onClick={() => togglePublished(p)} className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${p.is_active ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'}`}>
              {p.is_active ? 'LIVE' : 'OFF'}
            </button>
            <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-muted shrink-0"><Pencil className="w-4 h-4" /></button>
            <button onClick={() => deletePromotion(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive shrink-0"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        {promotions.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">No promotions yet. Add one when you're ready to run an event.</p>
        )}
      </div>
    </GlassCard>
  );
}
