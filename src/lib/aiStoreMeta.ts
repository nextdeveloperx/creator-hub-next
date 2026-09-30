/**
 * Baseline store-style social proof for the /ai/:slug page (rating, review count,
 * downloads and a few featured reviews). Real reviews submitted by users are merged
 * on top of this baseline in `mergeRatings`.
 *
 * NOTE: these baseline numbers/reviews are PLACEHOLDERS. Replace them with real
 * figures before relying on them as genuine customer feedback.
 */

export interface StoreReview {
  id: string;
  user_id?: string;
  name: string;
  rating: number;
  date: string;
  text: string;
  helpful?: number;
  /** true for user-submitted reviews stored in the database */
  real: boolean;
}

export interface StoreMeta {
  rating: number;
  reviewCount: number;
  downloadsLabel: string;
  /** Share of reviews per star, index 0 = 5 stars … index 4 = 1 star. Sums to 100. */
  distribution: number[];
  reviews: StoreReview[];
}

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : String(n));

export const formatCount = compact;

export function getBaseMeta(slug: string, productName: string, realSales = 0): StoreMeta {
  const h = hash(slug);
  // Base figure plus real paid orders for this product, so it grows with every sale.
  const downloads = 5000 + (h % 20) * 1000 + realSales;

  return {
    rating: 4.6 + (h % 4) / 10, // 4.6 – 4.9
    reviewCount: 800 + (h % 3200),
    downloadsLabel: `${downloads.toLocaleString('en-IN')}+`, // full number so every real sale is visible
    distribution: [78, 14, 5, 2, 1],
    reviews: [
      { id: 'seed-1', name: 'Rahul S.', rating: 5, date: '12 Sep 2026', helpful: 214, real: false, text: `${productName} ne mera daily kaam kaafi easy kar diya. Setup 5 minute mein ho gaya aur voice response ekdum fast hai.` },
      { id: 'seed-2', name: 'Ananya K.', rating: 5, date: '3 Sep 2026', helpful: 138, real: false, text: 'Paisa vasool. One-time payment mein lifetime access milna badi baat hai, aur updates bhi free aa rahe hain.' },
      { id: 'seed-3', name: 'Mohit V.', rating: 4, date: '28 Aug 2026', helpful: 61, real: false, text: 'Features bahut achhe hain. Bas chahta hoon ki aur customization options aayein. Baaki sab smooth chal raha hai.' },
      { id: 'seed-4', name: 'Sneha P.', rating: 5, date: '17 Aug 2026', helpful: 45, real: false, text: 'Support team ne turant help ki. Recommend karungi agar aap ek smart assistant dhundh rahe ho.' },
    ],
  };
}

interface RealReview {
  id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

/** Baseline + real reviews → the numbers and list shown on the page. */
export function mergeRatings(base: StoreMeta, real: RealReview[]): StoreMeta {
  const realCount = real.length;
  const total = base.reviewCount + realCount;
  const realSum = real.reduce((a, r) => a + r.rating, 0);
  const rating = (base.rating * base.reviewCount + realSum) / total;

  const realStars = [0, 0, 0, 0, 0];
  for (const r of real) realStars[5 - r.rating]++;
  const distribution = base.distribution.map((pct, i) =>
    Math.round(((pct / 100) * base.reviewCount + realStars[i]) / total * 100),
  );

  const realCards: StoreReview[] = real.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    name: r.user_name,
    rating: r.rating,
    date: new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    text: r.comment || '',
    real: true,
  }));

  return { ...base, rating, reviewCount: total, distribution, reviews: [...realCards, ...base.reviews] };
}
