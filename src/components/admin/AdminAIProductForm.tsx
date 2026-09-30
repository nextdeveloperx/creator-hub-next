import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { GlowButton } from '@/components/ui/GlowButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud, Loader2, X } from 'lucide-react';
import { ICON_NAMES, getIcon } from '@/lib/iconMap';
import type { AIProductRow } from '@/hooks/useAIProducts';

export interface AIProductFormState {
  slug: string;
  name: string;
  category: string;
  badge: string;
  subtitle: string;
  price: string;
  original_price: string;
  features: string;
  button_text: string;
  gradient_from: string;
  gradient_to: string;
  border_color: string;
  icon_name: string;
  logo_url: string;
  banner_url: string;
  screenshots: string[];
  is_coming_soon: boolean;
  is_active: boolean;
  is_featured: boolean;
  display_order: string;
}

export const EMPTY_AI_PRODUCT_FORM: AIProductFormState = {
  slug: '', name: '', category: 'assistant', badge: '', subtitle: '',
  price: '', original_price: '', features: '', button_text: 'Buy Now',
  gradient_from: '#7c3aed', gradient_to: '#a855f7', border_color: 'border-primary/30',
  icon_name: 'Sparkles', logo_url: '', banner_url: '', screenshots: [],
  is_coming_soon: false, is_active: true, is_featured: false, display_order: '0',
};

const CATEGORIES = ['assistant', 'companion', 'productivity', 'bundle'];

export function rowToForm(r: AIProductRow): AIProductFormState {
  return {
    slug: r.slug, name: r.name, category: r.category, badge: r.badge, subtitle: r.subtitle,
    price: String(r.price), original_price: r.original_price ? String(r.original_price) : '',
    features: r.features.join(', '), button_text: r.button_text,
    gradient_from: r.gradient_from, gradient_to: r.gradient_to, border_color: r.border_color,
    icon_name: r.icon_name, logo_url: r.logo_url || '', banner_url: r.banner_url || '', screenshots: r.screenshots || [],
    is_coming_soon: r.is_coming_soon, is_active: r.is_active, is_featured: r.is_featured,
    display_order: String(r.display_order),
  };
}

interface Props {
  form: AIProductFormState;
  onChange: (form: AIProductFormState) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
  isEditing: boolean;
}

export function AdminAIProductForm({ form, onChange, onSubmit, onCancel, saving, isEditing }: Props) {
  const { toast } = useToast();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const shotsInputRef = useRef<HTMLInputElement>(null);
  const [uploadingShots, setUploadingShots] = useState(false);

  const set = <K extends keyof AIProductFormState>(key: K, value: AIProductFormState[K]) =>
    onChange({ ...form, [key]: value });

  const uploadMedia = async (file: File, setLoadingFn: (v: boolean) => void, field: 'logo_url' | 'banner_url') => {
    setLoadingFn(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${field === 'logo_url' ? 'logos' : 'banners'}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('ai-product-media').upload(path, file);
      if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); return; }
      const { publicUrl } = supabase.storage.from('ai-product-media').getPublicUrl(path).data;
      set(field, publicUrl);
    } finally {
      setLoadingFn(false);
    }
  };

  const uploadScreenshots = async (files: FileList) => {
    setUploadingShots(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const path = `screenshots/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from('ai-product-media').upload(path, file);
        if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); continue; }
        urls.push(supabase.storage.from('ai-product-media').getPublicUrl(path).data.publicUrl);
      }
      if (urls.length) set('screenshots', [...form.screenshots, ...urls]);
    } finally {
      setUploadingShots(false);
      if (shotsInputRef.current) shotsInputRef.current.value = '';
    }
  };

  const Icon = getIcon(form.icon_name);

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input placeholder="e.g. Jarvis" value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Slug (unique, no spaces) *</Label>
          <Input placeholder="jarvis" value={form.slug} onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} disabled={isEditing} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => set('category', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Badge</Label>
          <Input placeholder="MOST POPULAR" value={form.badge} onChange={(e) => set('badge', e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Input placeholder="AI System Assistant for Power Users" value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Price (₹) *</Label>
          <Input type="number" min={0} value={form.price} onChange={(e) => set('price', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Original Price (₹, optional)</Label>
          <Input type="number" min={0} value={form.original_price} onChange={(e) => set('original_price', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Display Order</Label>
          <Input type="number" value={form.display_order} onChange={(e) => set('display_order', e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Features (comma separated)</Label>
        <Textarea placeholder="Voice Input, Full System Automation, ..." value={form.features} onChange={(e) => set('features', e.target.value)} rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Button Text</Label>
        <Input placeholder="Buy Jarvis" value={form.button_text} onChange={(e) => set('button_text', e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <Label>Gradient From</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={form.gradient_from} onChange={(e) => set('gradient_from', e.target.value)} className="w-9 h-9 rounded border border-border bg-transparent" />
            <Input value={form.gradient_from} onChange={(e) => set('gradient_from', e.target.value)} className="font-mono text-sm" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Gradient To</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={form.gradient_to} onChange={(e) => set('gradient_to', e.target.value)} className="w-9 h-9 rounded border border-border bg-transparent" />
            <Input value={form.gradient_to} onChange={(e) => set('gradient_to', e.target.value)} className="font-mono text-sm" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Icon</Label>
          <Select value={form.icon_name} onValueChange={(v) => set('icon_name', v)}>
            <SelectTrigger>
              <div className="flex items-center gap-2"><Icon className="w-4 h-4" /><SelectValue /></div>
            </SelectTrigger>
            <SelectContent>
              {ICON_NAMES.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Logo (optional — overrides icon)</Label>
          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadMedia(e.target.files[0], setUploadingLogo, 'logo_url')} />
          {form.logo_url ? (
            <div className="flex items-center gap-2">
              <img src={form.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-cover border border-border" />
              <button type="button" onClick={() => set('logo_url', '')} className="p-1.5 rounded-md hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div onClick={() => logoInputRef.current?.click()} className="border-2 border-dashed rounded-lg p-3 cursor-pointer text-center text-sm text-muted-foreground hover:border-primary/50 transition-colors">
              {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <><UploadCloud className="w-4 h-4 mx-auto mb-1" />Upload logo</>}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label>Banner (optional)</Label>
          <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadMedia(e.target.files[0], setUploadingBanner, 'banner_url')} />
          {form.banner_url ? (
            <div className="flex items-center gap-2">
              <img src={form.banner_url} alt="Banner" className="w-16 h-10 rounded-lg object-cover border border-border" />
              <button type="button" onClick={() => set('banner_url', '')} className="p-1.5 rounded-md hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div onClick={() => bannerInputRef.current?.click()} className="border-2 border-dashed rounded-lg p-3 cursor-pointer text-center text-sm text-muted-foreground hover:border-primary/50 transition-colors">
              {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <><UploadCloud className="w-4 h-4 mx-auto mb-1" />Upload banner</>}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Screenshots (portrait images work best — shown on the product page)</Label>
        <input ref={shotsInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files?.length && uploadScreenshots(e.target.files)} />
        <div className="flex flex-wrap gap-2">
          {form.screenshots.map((url, i) => (
            <div key={url} className="relative">
              <img src={url} alt={`Screenshot ${i + 1}`} className="w-16 h-28 rounded-lg object-cover border border-border" />
              <button
                type="button"
                aria-label={`Remove screenshot ${i + 1}`}
                onClick={() => set('screenshots', form.screenshots.filter((u) => u !== url))}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-background border border-border hover:bg-muted"
              ><X className="w-3 h-3" /></button>
            </div>
          ))}
          <div onClick={() => shotsInputRef.current?.click()} className="w-16 h-28 border-2 border-dashed rounded-lg cursor-pointer flex flex-col items-center justify-center text-xs text-muted-foreground hover:border-primary/50 transition-colors">
            {uploadingShots ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UploadCloud className="w-4 h-4 mb-1" />Add</>}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={form.is_active} onCheckedChange={(v) => set('is_active', v)} />
          <Label>Active (visible on site)</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.is_featured} onCheckedChange={(v) => set('is_featured', v)} />
          <Label>Featured (top highlight card)</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.is_coming_soon} onCheckedChange={(v) => set('is_coming_soon', v)} />
          <Label>Coming Soon</Label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <GlowButton onClick={onSubmit} className="flex-1" disabled={saving}>
          {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
        </GlowButton>
        {isEditing && <GlowButton variant="outline" onClick={onCancel}>Cancel</GlowButton>}
      </div>
    </div>
  );
}
