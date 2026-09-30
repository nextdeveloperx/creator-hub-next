import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PageSection {
  key: string;
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  banner_url: string | null;
  button_text: string;
  button_url: string | null;
  is_visible: boolean;
  updated_at: string;
}

/** One editable content block (see the admin "AI Page Sections" screen). `null` until loaded or when missing. */
export function usePageSection(key: string) {
  const [section, setSection] = useState<PageSection | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSection = useCallback(async () => {
    const { data } = await supabase.from('page_sections').select('*').eq('key', key).maybeSingle();
    setSection((data as PageSection) || null);
    setLoading(false);
  }, [key]);

  useEffect(() => { fetchSection(); }, [fetchSection]);

  return { section, loading, refetch: fetchSection };
}
