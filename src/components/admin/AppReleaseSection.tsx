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
import { Plus, X, UploadCloud, Pencil, Trash2, Loader2, Smartphone, Monitor } from 'lucide-react';
import type { AppRelease } from '@/hooks/useAppReleases';

interface FormState {
  app_name: string;
  platform: string;
  version_name: string;
  version_code: string;
  release_notes: string;
  download_url: string;
  file_size_mb: string;
  icon_url: string;
  is_published: boolean;
}

const EMPTY: FormState = {
  app_name: '',
  platform: 'android',
  version_name: '',
  version_code: '',
  release_notes: '',
  download_url: '',
  file_size_mb: '',
  icon_url: '',
  is_published: false,
};

export function AppReleaseSection() {
  const { toast } = useToast();
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const fetchReleases = useCallback(async () => {
    const { data } = await supabase.from('app_releases').select('*').order('created_at', { ascending: false });
    if (data) setReleases(data as AppRelease[]);
  }, []);

  useEffect(() => { fetchReleases(); }, [fetchReleases]);

  const set = (key: keyof FormState, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (r: AppRelease) => {
    setForm({
      app_name: r.app_name,
      platform: r.platform,
      version_name: r.version_name,
      version_code: r.version_code ? String(r.version_code) : '',
      release_notes: r.release_notes || '',
      download_url: r.download_url,
      file_size_mb: r.file_size_mb ? String(r.file_size_mb) : '',
      icon_url: r.icon_url || '',
      is_published: r.is_published,
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  // Upload the APK/EXE straight into Supabase Storage and drop the public URL into the form -
  // this is the actual "upload" the admin panel needs, not just a link field.
  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('app-releases').upload(path, file);
      if (error) {
        toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
        return;
      }
      const { publicUrl } = supabase.storage.from('app-releases').getPublicUrl(path).data;
      setForm((f) => ({
        ...f,
        download_url: publicUrl,
        file_size_mb: f.file_size_mb || (file.size / (1024 * 1024)).toFixed(1),
      }));
      toast({ title: 'File uploaded — link filled in below' });
    } finally {
      setUploadingFile(false);
    }
  };

  // App icon shown on the release card (public image bucket)
  const handleIconUpload = async (file: File) => {
    setUploadingIcon(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `release-icons/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('ai-product-media').upload(path, file);
      if (error) { toast({ title: 'Icon upload failed', description: error.message, variant: 'destructive' }); return; }
      set('icon_url', supabase.storage.from('ai-product-media').getPublicUrl(path).data.publicUrl);
    } finally {
      setUploadingIcon(false);
      if (iconInputRef.current) iconInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!form.app_name.trim()) { toast({ title: 'App name is required', variant: 'destructive' }); return; }
    if (!form.version_name.trim()) { toast({ title: 'Version is required', variant: 'destructive' }); return; }
    if (!form.download_url.trim()) { toast({ title: 'Upload a file or paste a download link', variant: 'destructive' }); return; }

    setSaving(true);
    try {
      const payload = {
        app_name: form.app_name.trim(),
        platform: form.platform,
        version_name: form.version_name.trim(),
        version_code: form.version_code ? Number(form.version_code) : null,
        release_notes: form.release_notes.trim() || null,
        download_url: form.download_url.trim(),
        file_size_mb: form.file_size_mb ? Number(form.file_size_mb) : null,
        icon_url: form.icon_url.trim() || null,
        is_published: form.is_published,
      };

      const { error } = editingId
        ? await supabase.from('app_releases').update(payload).eq('id', editingId)
        : await supabase.from('app_releases').insert(payload);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: editingId ? 'Release updated!' : 'Release created!' });
        resetForm();
        fetchReleases();
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteRelease = async (id: string) => {
    const { error } = await supabase.from('app_releases').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    } else {
      toast({ title: 'Release deleted' });
      fetchReleases();
    }
  };

  const togglePublished = async (r: AppRelease) => {
    const { error } = await supabase.from('app_releases').update({ is_published: !r.is_published }).eq('id', r.id);
    if (!error) fetchReleases();
  };

  return (
    <GlassCard>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">App Releases</h2>
          <p className="text-xs text-muted-foreground mt-1">Upload an APK/EXE or paste a link, then publish it to the home page Download section.</p>
        </div>
        <GlowButton size="sm" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
          {showForm ? <><X className="w-4 h-4" /> Close</> : <><Plus className="w-4 h-4" /> Add Release</>}
        </GlowButton>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border border-border rounded-lg bg-muted/20 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>App Name *</Label>
              <Input placeholder="e.g. MYRA" value={form.app_name} onChange={(e) => set('app_name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={form.platform} onValueChange={(v) => set('platform', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="android">Android (.apk)</SelectItem>
                  <SelectItem value="windows">Windows (.exe)</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Version Name *</Label>
              <Input placeholder="1.0.0" value={form.version_name} onChange={(e) => set('version_name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Version Code (optional)</Label>
              <Input type="number" placeholder="1" value={form.version_code} onChange={(e) => set('version_code', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>App File</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".apk,.exe,.zip"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors text-center border-border hover:border-primary/50"
            >
              {uploadingFile ? (
                <div className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  <UploadCloud className="w-6 h-6 mx-auto mb-2" />
                  Click to upload the APK / EXE file
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>App Icon (optional)</Label>
            <input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleIconUpload(e.target.files[0])} />
            {form.icon_url ? (
              <div className="flex items-center gap-3">
                <img src={form.icon_url} alt="App icon" className="w-14 h-14 rounded-2xl object-cover border border-border" />
                <button type="button" aria-label="Remove icon" onClick={() => set('icon_url', '')} className="p-1.5 rounded-md hover:bg-muted"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div onClick={() => iconInputRef.current?.click()} className="border-2 border-dashed rounded-lg p-4 cursor-pointer text-center text-sm text-muted-foreground hover:border-primary/50 transition-colors">
                {uploadingIcon ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <><UploadCloud className="w-4 h-4 mx-auto mb-1" />Upload app icon</>}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Download Link (auto-filled after upload, or paste one directly)</Label>
            <Input placeholder="https://..." value={form.download_url} onChange={(e) => set('download_url', e.target.value)} className="font-mono text-sm" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>File Size (MB, optional)</Label>
              <Input type="number" placeholder="45" value={form.file_size_mb} onChange={(e) => set('file_size_mb', e.target.value)} />
            </div>
            <div className="flex items-center gap-2 pt-7">
              <Switch checked={form.is_published} onCheckedChange={(v) => set('is_published', v)} />
              <Label>Published (visible on the home page)</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Release Notes (optional)</Label>
            <Textarea placeholder="What's new in this version..." value={form.release_notes} onChange={(e) => set('release_notes', e.target.value)} rows={3} />
          </div>

          <div className="flex gap-3 pt-2">
            <GlowButton onClick={handleSubmit} className="flex-1" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Release' : 'Publish Release'}
            </GlowButton>
            {editingId && <GlowButton variant="outline" onClick={resetForm}>Cancel</GlowButton>}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {releases.map((r) => {
          const Icon = r.platform === 'android' ? Smartphone : Monitor;
          return (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/10">
              {r.icon_url ? (
                <img src={r.icon_url} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{r.app_name} <span className="text-muted-foreground font-normal">v{r.version_name}</span></p>
                <p className="text-xs text-muted-foreground">{r.platform}{r.file_size_mb ? ` • ${r.file_size_mb} MB` : ''}</p>
              </div>
              <button
                onClick={() => togglePublished(r)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${r.is_published ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'}`}
              >
                {r.is_published ? 'PUBLISHED' : 'DRAFT'}
              </button>
              <button onClick={() => startEdit(r)} className="p-2 rounded-lg hover:bg-muted shrink-0"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => deleteRelease(r.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          );
        })}
        {releases.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">No app releases yet. Add your first one!</p>
        )}
      </div>
    </GlassCard>
  );
}
