import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AIProductRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  badge: string;
  subtitle: string;
  price: number;
  original_price: number | null;
  features: string[];
  button_text: string;
  gradient_from: string;
  gradient_to: string;
  border_color: string;
  icon_name: string;
  logo_url: string | null;
  banner_url: string | null;
  is_coming_soon: boolean;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/** Active AI products, in admin-defined display order. Public-facing (respects is_active RLS). */
export function useAIProducts() {
  const [products, setProducts] = useState<AIProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ai_products')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    setProducts((data as AIProductRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return { products, loading, refetch: fetchProducts };
}

/** A single active AI product by slug, for the product detail page. */
export function useAIProduct(slug: string | undefined) {
  const [product, setProduct] = useState<AIProductRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    supabase
      .from('ai_products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setProduct((data as AIProductRow) || null);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [slug]);

  return { product, loading };
}
