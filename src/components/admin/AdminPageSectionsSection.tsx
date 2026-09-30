import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, UploadCloud, X, ExternalLink } from 'lucide-react';
import type { PageSection } from '@/hooks/usePageSection';

const SECTIONS: { key: string; label: string; hint: string; defaults: Omit<PageSection, 'key' | 'updated_at'> }[] = [
  {
    key: 'android_app',
    label: 'Get the Android App',
    hint: 'Shown on the AI page above the list of Android releases.',
    defaults: {
      eyebrow: 'DOWNLOADS', title: 'Get the', highlight: 'Android App',
      description: 'Your voice assistant lives in your pocket. Grab the latest build, straight from the source.',
      banner_url: null, button_text: 'Download', button_url: null, is_visible: true,
    },
  },
  {
    key: 'pc_controller',
    label: 'Myra PC Controller',
    hint: 'Shown on the AI page. A link set here replaces the latest Windows release link.',
    defaults: {
      eyebrow: 'PC CONTROLLER', title: 'Control Your PC from Your Phone', highlight: 'PC',
      description: "Free desktop companion for Windows — connect it to the Myra Android app and control your PC's screen, files and apps right from your phone.",
      banner_url: null, button_text: 'Download Myra PC Controller (.exe)', button_url: null, is_visible: true,
    },
  },
];

type Draft = Omit<PageSection, 'updated_at'>;

function SectionCard({ def, initial, onSaved }: { def: (typeof SECTIONS)[number]; initial: Draft; onSaved: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState<Draft>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setForm(initial); }, [initial]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setForm((f) => ({ ...f, [k]: v }));

  const uploadBanner = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `sections/${def.key}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('ai-product-media').upload(path, file);
      if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); return; }
      set('banner_url', supabase.storage.from('ai-product-media').getPublicUrl(path).data.publicUrl);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const save = async () => {
    const url = form.button_url?.trim() || null;
    if (url && !/^https?:\/\//i.test(url)) {
      toast({ title: 'Button link must start with http:// or https://', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('page_sections').upsert({
      key: form.key,
      eyebrow: form.eyebrow.trim(),
      title: form.title.trim(),
      highlight: form.highlight.trim(),
      description: form.description.trim(),
      banner_url: form.banner_url || null,
      button_text: form.button_text.trim() || 'Download',
      button_url: url,
      is_visible: form.is_visible,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) { toast({ title: 'Could not save', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Saved. The AI page is updated.' });
    onSaved();
  };

  return (
    <GlassCard>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-lg font-bold">{def.label}</h3>
          <p className="text-xs text-muted-foreground mt-1">{def.hint}</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.is_visible} onCheckedChange={(v) => set('is_visible', v)} id={`vis-${def.key}`} />
          <Label htmlFor={`vis-${def.key}`}>Show on site</Label>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        <div className="space-y-2">
          <Label>Small label</Label>
          <Input value={form.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Heading</Label>
          <Input value={form.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Glowing word(s)</Label>
          <Input value={form.highlight} onChange={(e) => set('highlight', e.target.value)} />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <Label>Description</Label>
        <Textarea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div className="space-y-2">
          <Label>Banner image</Label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadBanner(e.target.files[0])} />
          {form.banner_url ? (
            <div className="relative">
              <img src={form.banner_url} alt="Banner preview" className="w-full aspect-[21/9] object-cover rounded-xl border border-border" />
              <button
                type="button"
                aria-label="Remove banner"
                onClick={() => set('banner_url', null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 border border-border hover:bg-muted"
              ><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-6 cursor-pointer text-center text-sm text-muted-foreground hover:border-primary/50 transition-colors"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><UploadCloud className="w-5 h-5 mx-auto mb-1" />Upload banner (leave empty for the default)</>}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Button text</Label>
            <Input value={form.button_text} onChange={(e) => set('button_text', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Button link (download URL)</Label>
            <Input placeholder="https://..." value={form.button_url ?? ''} onChange={(e) => set('button_url', e.target.value)} />
            {form.button_url && (
              <a href={form.button_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                Test link <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      <GlowButton onClick={save} disabled={saving}>
        {saving ? 'Saving...' : 'Save changes'}
      </GlowButton>
    </GlassCard>
  );
}

export function AdminPageSectionsSection() {
  const [rows, setRows] = useState<Record<string, Draft>>({});
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('page_sections').select('*');
    const map: Record<string, Draft> = {};
    for (const s of SECTIONS) {
      const found = (data as PageSection[] | null)?.find((r) => r.key === s.key);
      map[s.key] = found ? { ...found } : { key: s.key, ...s.defaults };
    }
    setRows(map);
    setLoaded(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">AI Page Sections</h2>
        <p className="text-xs text-muted-foreground mt-1">Edit the download blocks on the AI page: image, text and the download button link.</p>
      </div>
      {!loaded ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        SECTIONS.map((def) => <SectionCard key={def.key} def={def} initial={rows[def.key]} onSaved={load} />)
      )}
    </div>
  );
}
