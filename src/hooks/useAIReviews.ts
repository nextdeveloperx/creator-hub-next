import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AIReview {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

/** Reviews for one AI product, plus rating summary (average, count, per-star percentages). */
export function useAIReviews(productId: string | undefined) {
  const [reviews, setReviews] = useState<AIReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    if (!productId) { setLoading(false); return; }
    const { data } = await supabase
      .from('ai_product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    setReviews((data as AIReview[]) || []);
    setLoading(false);
  }, [productId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const summary = useMemo(() => {
    const count = reviews.length;
    const counts = [0, 0, 0, 0, 0]; // index 0 = 5 stars
    let total = 0;
    for (const r of reviews) { counts[5 - r.rating]++; total += r.rating; }
    return {
      count,
      average: count ? total / count : 0,
      distribution: counts.map((c) => (count ? Math.round((c / count) * 100) : 0)),
    };
  }, [reviews]);

  return { reviews, summary, loading, refetch: fetchReviews };
}
