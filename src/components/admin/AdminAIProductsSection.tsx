import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Plus, X, Pencil, Trash2, Camera, Loader2 } from 'lucide-react';
import { getIcon } from '@/lib/iconMap';
import { AdminAIProductForm, AIProductFormState, EMPTY_AI_PRODUCT_FORM, rowToForm } from './AdminAIProductForm';
import type { AIProductRow } from '@/hooks/useAIProducts';

const BUCKET = 'ai-product-media';

async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** One-click app icon + screenshot upload for a product row (saves straight to the DB). */
function QuickMedia({ product, onDone }: { product: AIProductRow; onDone: () => void }) {
  const { toast } = useToast();
  const iconRef = useRef<HTMLInputElement>(null);
  const shotsRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'icon' | 'shots' | null>(null);

  const run = async (kind: 'icon' | 'shots', files: FileList | null) => {
    if (!files?.length) return;
    setBusy(kind);
    try {
      if (kind === 'icon') {
        const url = await uploadImage(files[0], 'logos');
        const { error } = await supabase.from('ai_products').update({ logo_url: url }).eq('id', product.id);
        if (error) throw error;
      } else {
        const urls: string[] = [];
        for (const f of Array.from(files)) urls.push(await uploadImage(f, 'screenshots'));
        const { error } = await supabase.from('ai_products').update({ screenshots: [...(product.screenshots || []), ...urls] }).eq('id', product.id);
        if (error) throw error;
      }
      toast({ title: kind === 'icon' ? 'App icon updated' : 'Screenshots added' });
      onDone();
    } catch (e) {
      toast({ title: 'Upload failed', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setBusy(null);
      if (iconRef.current) iconRef.current.value = '';
      if (shotsRef.current) shotsRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      <input ref={iconRef} type="file" accept="image/*" className="hidden" onChange={(e) => run('icon', e.target.files)} />
      <input ref={shotsRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => run('shots', e.target.files)} />
      <button
        type="button"
        onClick={() => iconRef.current?.click()}
        disabled={busy !== null}
        className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        {busy === 'icon' ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
        {product.logo_url ? 'CHANGE ICON' : 'ADD ICON'}
      </button>
      <button
        type="button"
        onClick={() => shotsRef.current?.click()}
        disabled={busy !== null}
        className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        {busy === 'shots' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
        SCREENSHOTS ({product.screenshots?.length || 0})
      </button>
    </div>
  );
}

export function AdminAIProductsSection() {
  const { toast } = useToast();
  const [products, setProducts] = useState<AIProductRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AIProductFormState>(EMPTY_AI_PRODUCT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase.from('ai_products').select('*').order('display_order', { ascending: true });
    if (data) setProducts(data as AIProductRow[]);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const resetForm = () => { setForm(EMPTY_AI_PRODUCT_FORM); setEditingId(null); setShowForm(false); };
  const startEdit = (p: AIProductRow) => { setForm(rowToForm(p)); setEditingId(p.id); setShowForm(true); };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    if (!form.slug.trim()) { toast({ title: 'Slug is required', variant: 'destructive' }); return; }
    if (!form.price || Number(form.price) < 0) { toast({ title: 'Valid price is required', variant: 'destructive' }); return; }

    setSaving(true);
    try {
      const payload = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        category: form.category,
        badge: form.badge.trim(),
        subtitle: form.subtitle.trim(),
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        features: form.features ? form.features.split(',').map((f) => f.trim()).filter(Boolean) : [],
        button_text: form.button_text.trim() || 'Buy Now',
        gradient_from: form.gradient_from,
        gradient_to: form.gradient_to,
        border_color: form.border_color || 'border-primary/30',
        icon_name: form.icon_name,
        logo_url: form.logo_url || null,
        banner_url: form.banner_url || null,
        screenshots: form.screenshots,
        is_coming_soon: form.is_coming_soon,
        is_active: form.is_active,
        is_featured: form.is_featured,
        display_order: Number(form.display_order) || 0,
      };

      const { error } = editingId
        ? await supabase.from('ai_products').update(payload).eq('id', editingId)
        : await supabase.from('ai_products').insert(payload);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: editingId ? 'Product updated!' : 'Product created!' });
        resetForm();
        fetchProducts();
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('ai_products').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    else { toast({ title: 'Product deleted' }); fetchProducts(); }
  };

  const toggleField = async (p: AIProductRow, field: 'is_active' | 'is_featured') => {
    const { error } = await supabase.from('ai_products').update({ [field]: !p[field] }).eq('id', p.id);
    if (!error) fetchProducts();
  };

  return (
    <GlassCard>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">AI Products</h2>
          <p className="text-xs text-muted-foreground mt-1">Every AI assistant card shown on the site — price, title, features, logo, banner, colors.</p>
        </div>
        <GlowButton size="sm" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
          {showForm ? <><X className="w-4 h-4" /> Close</> : <><Plus className="w-4 h-4" /> Add Product</>}
        </GlowButton>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border border-border rounded-lg bg-muted/20">
          <AdminAIProductForm form={form} onChange={setForm} onSubmit={handleSubmit} onCancel={resetForm} saving={saving} isEditing={!!editingId} />
        </div>
      )}

      <div className="space-y-3">
        {products.map((p) => {
          const Icon = getIcon(p.icon_name);
          return (
            <div key={p.id} className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/10">
              {p.logo_url ? (
                <img src={p.logo_url} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border" />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${p.gradient_from}, ${p.gradient_to})` }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{p.name} <span className="text-muted-foreground font-normal">₹{p.price}{p.original_price ? ` (was ₹${p.original_price})` : ''}</span></p>
                <p className="text-xs text-muted-foreground truncate">{p.category} • {p.subtitle}</p>
              </div>
              <QuickMedia product={p} onDone={fetchProducts} />
              {p.is_coming_soon && <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/15 text-amber-500 shrink-0">SOON</span>}
              <button onClick={() => toggleField(p, 'is_featured')} className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${p.is_featured ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {p.is_featured ? 'FEATURED' : 'STANDARD'}
              </button>
              <button onClick={() => toggleField(p, 'is_active')} className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${p.is_active ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                {p.is_active ? 'ACTIVE' : 'HIDDEN'}
              </button>
              <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-muted shrink-0"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          );
        })}
        {products.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">No AI products yet. Add your first one!</p>
        )}
      </div>
    </GlassCard>
  );
}
