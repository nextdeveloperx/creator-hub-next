import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check, Loader2, Lock, Star, Share2, ShieldCheck, Trash2, ThumbsUp, Download, Zap, Infinity as InfinityIcon, RefreshCw } from 'lucide-react';
import { useAIProduct } from '@/hooks/useAIProducts';
import { useAIReviews } from '@/hooks/useAIReviews';
import { usePublicStats } from '@/hooks/usePublicStats';
import { getBaseMeta, mergeRatings, formatCount } from '@/lib/aiStoreMeta';
import { useActivePromotion, applyDiscount } from '@/hooks/useActivePromotion';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getIcon } from '@/lib/iconMap';
import { PaymentModal } from '@/components/shop/PaymentModal';
import { OfferBadge } from '@/components/ai/OfferBadge';

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}
        />
      ))}
    </span>
  );
}

export default function AIProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { product, loading } = useAIProduct(slug);
  const { promotion } = useActivePromotion('ai_products');
  const { handlePurchaseWithDetails, processing } = useRazorpay();
  const { reviews, refetch: refetchReviews } = useAIReviews(product?.id);
  const { stats: live } = usePublicStats();
  const [buying, setBuying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-muted-foreground text-lg">AI assistant not found</p>
          <button onClick={() => navigate('/ai')} className="text-primary hover:underline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to AI Assistants
          </button>
        </div>
      </Layout>
    );
  }

  const Icon = getIcon(product.icon_name);
  const onOffer = !!promotion && (promotion.product_ids.length === 0 || promotion.product_ids.includes(product.id));
  const discounted = applyDiscount(product.price, promotion, product.id);
  const displayPrice = discounted < product.price ? discounted : product.price;
  const strikePrice = displayPrice < product.price ? product.price : (product.original_price ?? null);
  const gradient = `linear-gradient(135deg, ${product.gradient_from}, ${product.gradient_to})`;
  const comingSoon = product.is_coming_soon;
  const meta = mergeRatings(getBaseMeta(product.slug, product.name, live.byProduct[product.name] ?? 0), reviews);
  const myReview = reviews.find((r) => r.user_id === user?.id);

  const handleConfirmPurchase = (name: string, mobile: string) => {
    handlePurchaseWithDetails({
      productName: product.name,
      price: displayPrice,
      userName: name,
      userMobile: mobile,
      themeColor: product.gradient_from,
    });
    setBuying(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: product.subtitle, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* share dismissed */
    }
  };

  const submitReview = async () => {
    if (!user || myRating < 1) return;
    setSubmitting(true);
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
    const name = profile?.full_name?.trim() || user.email?.split('@')[0] || 'Customer';
    const { error } = await supabase.from('ai_product_reviews').upsert(
      {
        product_id: product.id,
        user_id: user.id,
        user_name: name,
        rating: myRating,
        comment: myComment.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'product_id,user_id' },
    );
    setSubmitting(false);
    if (error) {
      toast({ title: 'Could not save review', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Thanks for your review!' });
    setMyRating(0);
    setMyComment('');
    refetchReviews();
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from('ai_product_reviews').delete().eq('id', id);
    if (error) {
      toast({ title: 'Could not delete review', description: error.message, variant: 'destructive' });
      return;
    }
    refetchReviews();
  };

  const renderBuyButton = (className = '') => (
    <motion.button
      whileTap={comingSoon || reduceMotion ? {} : { scale: 0.97 }}
      disabled={processing || comingSoon}
      onClick={() => !comingSoon && setBuying(true)}
      className={`min-h-[48px] px-8 rounded-full font-semibold text-sm text-white flex items-center justify-center gap-2 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-primary disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      style={{ background: gradient }}
    >
      {comingSoon ? <Lock className="w-4 h-4" /> : processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {comingSoon ? 'Coming soon' : `${product.button_text} · ₹${displayPrice}`}
    </motion.button>
  );

  const shots = [...(product.banner_url ? [product.banner_url] : []), ...(product.screenshots || [])];
  const previewTiles = shots.length
    ? shots.map((src) => ({ kind: 'image' as const, src }))
    : product.features.slice(0, 5).map((f) => ({ kind: 'feature' as const, text: f }));

  return (
    <Layout>
      <section className="pt-6 pb-28 md:py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <button
            onClick={() => navigate('/ai')}
            className="flex items-center gap-2 min-h-[44px] text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          >
            <ArrowLeft className="w-4 h-4" /> AI Assistants
          </button>

          {/* App header */}
          <motion.header
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative mt-2"
          >
            {onOffer && <OfferBadge className="-top-2 -left-2" />}
            <div className="flex gap-4 md:gap-6 items-start">
              {product.logo_url ? (
                <img
                  src={product.logo_url}
                  alt=""
                  className="w-24 h-24 md:w-32 md:h-32 rounded-[22%] object-cover shadow-lg flex-shrink-0"
                />
              ) : (
                <span
                  className="w-24 h-24 md:w-32 md:h-32 rounded-[22%] flex items-center justify-center shadow-lg flex-shrink-0"
                  style={{ background: gradient }}
                >
                  <Icon className="w-10 h-10 md:w-14 md:h-14 text-white" aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">{product.name}</h1>
                <p className="text-sm font-semibold mt-1" style={{ color: product.gradient_to }}>Next Developer</p>
                <p className="text-xs text-muted-foreground mt-1">{product.badge} · {product.category}</p>
              </div>
            </div>

            {/* Stats row */}
            <dl className="grid grid-cols-3 mt-6 py-3 rounded-2xl border border-border bg-card/50 divide-x divide-border text-center">
              <div className="px-2">
                <dt className="sr-only">Rating</dt>
                <dd className="text-base md:text-lg font-semibold text-foreground flex items-center justify-center gap-1">
                  {meta.rating.toFixed(1)} <Star className="w-3.5 h-3.5 fill-foreground text-foreground" aria-hidden="true" />
                </dd>
                <p className="text-xs text-muted-foreground mt-0.5">{formatCount(meta.reviewCount)} reviews</p>
              </div>
              <div className="px-2">
                <dt className="sr-only">Downloads</dt>
                <dd className="text-base md:text-lg font-semibold text-foreground flex items-center justify-center gap-1">
                  <Download className="w-4 h-4" aria-hidden="true" /> {meta.downloadsLabel}
                </dd>
                <p className="text-xs text-muted-foreground mt-0.5">Downloads</p>
              </div>
              <div className="px-2">
                <dt className="sr-only">Access</dt>
                <dd className="text-base md:text-lg font-semibold text-foreground">Lifetime</dd>
                <p className="text-xs text-muted-foreground mt-0.5">One-time pay</p>
              </div>
            </dl>

            {/* Install row (desktop / tablet) */}
            <div className="hidden md:flex items-center gap-4 mt-6">
              {renderBuyButton('flex-1 max-w-xs')}
              <button
                onClick={handleShare}
                className="min-h-[48px] px-4 rounded-full border border-border text-sm text-foreground flex items-center gap-2 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" /> {copied ? 'Link copied' : 'Share'}
              </button>
              {strikePrice && (
                <span className="text-sm text-muted-foreground">
                  <span className="line-through mr-1">₹{strikePrice}</span> now ₹{displayPrice}
                </span>
              )}
            </div>
            <p className="hidden md:block text-xs text-muted-foreground mt-2">
              Includes future updates and support after purchase.
            </p>
          </motion.header>

          {/* Screenshots */}
          {previewTiles.length > 0 && (
            <section aria-label="Screenshots" className="mt-8 -mx-4 px-4">
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 [scrollbar-width:thin]">
                {previewTiles.map((t, i) => (
                  <div
                    key={i}
                    className="snap-start flex-shrink-0 w-40 md:w-48 aspect-[9/16] rounded-2xl overflow-hidden border border-border relative"
                  >
                    {t.kind === 'image' ? (
                      <img src={t.src} alt={`${product.name} screenshot ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full p-4 flex flex-col justify-end" style={{ background: gradient }}>
                        <Check className="w-6 h-6 text-white mb-3" aria-hidden="true" />
                        <p className="text-white font-semibold text-sm leading-snug">{t.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* About */}
          <section className="mt-8" aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-lg font-semibold text-foreground">About this assistant</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-prose">{product.subtitle}</p>
            <ul className="mt-4 space-y-2.5">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: product.gradient_to }} aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 mt-5">
              {[
                { icon: Zap, label: 'Instant delivery' },
                { icon: InfinityIcon, label: 'Lifetime access' },
                { icon: RefreshCw, label: 'Free updates' },
              ].map(({ icon: I, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs text-foreground/80">
                  <I className="w-3.5 h-3.5" aria-hidden="true" /> {label}
                </span>
              ))}
            </div>
          </section>

          {/* Ratings & reviews */}
          <section className="mt-10" aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="text-lg font-semibold text-foreground">Ratings and reviews</h2>

            <div className="flex items-center gap-6 mt-4">
              <div className="text-center flex-shrink-0">
                <p className="text-5xl font-light text-foreground">{meta.rating.toFixed(1)}</p>
                <Stars value={meta.rating} />
                <p className="text-xs text-muted-foreground mt-1">{meta.reviewCount.toLocaleString('en-IN')} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5" role="list" aria-label="Rating distribution">
                {meta.distribution.map((pct, idx) => (
                  <div key={idx} role="listitem" className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-2 text-right">{5 - idx}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: gradient }}
                        initial={reduceMotion ? { width: `${pct}%` } : { width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                      />
                    </div>
                    <span className="sr-only">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rate this assistant */}
            <div className="mt-6 rounded-2xl border border-border bg-card/50 p-5">
              <h3 className="text-sm font-semibold text-foreground">{myReview ? 'Update your rating' : 'Rate this assistant'}</h3>
              {user ? (
                <>
                  <p className="text-xs text-muted-foreground mt-1">Tell others what you think.</p>
                  <div className="flex gap-1 mt-3" role="radiogroup" aria-label="Your rating">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={myRating === n}
                        aria-label={`${n} star${n > 1 ? 's' : ''}`}
                        onClick={() => setMyRating(n)}
                        className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Star className={`w-7 h-7 transition-colors ${n <= myRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/50'}`} />
                      </button>
                    ))}
                  </div>
                  <label htmlFor="review-comment" className="sr-only">Your review</label>
                  <textarea
                    id="review-comment"
                    value={myComment}
                    onChange={(e) => setMyComment(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    placeholder="Describe your experience (optional)"
                    className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={submitReview}
                    disabled={myRating < 1 || submitting}
                    className="mt-3 min-h-[44px] px-6 rounded-full text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    style={{ background: gradient }}
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {myReview ? 'Update review' : 'Submit review'}
                  </button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  <Link to="/auth" className="text-primary font-medium hover:underline">Sign in</Link> to rate and review this assistant.
                </p>
              )}
            </div>

            <ul className="mt-6 space-y-5">
              {meta.reviews.map((r) => (
                <li key={r.id} className="border-t border-border pt-5">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                      style={{ background: gradient }}
                      aria-hidden="true"
                    >
                      {r.name[0]?.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-foreground flex-1 min-w-0 truncate">{r.name}</span>
                    {r.real && (r.user_id === user?.id || isAdmin) && (
                      <button
                        type="button"
                        onClick={() => deleteReview(r.id)}
                        aria-label="Delete review"
                        className="w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Stars value={r.rating} size={12} />
                    <span className="sr-only">{r.rating} out of 5 stars</span>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  {r.text && <p className="text-sm text-foreground/80 mt-2 leading-relaxed max-w-prose">{r.text}</p>}
                  {r.helpful ? (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                      <ThumbsUp className="w-3 h-3" aria-hidden="true" /> {r.helpful} people found this helpful
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          {/* Safety */}
          <section className="mt-10 rounded-2xl border border-border bg-card/50 p-5 flex gap-3" aria-labelledby="safe-heading">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: product.gradient_to }} aria-hidden="true" />
            <div>
              <h2 id="safe-heading" className="text-sm font-semibold text-foreground">Secure payment</h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Payments are processed by Razorpay. See our refund policy on the Refund page before you buy.
              </p>
            </div>
          </section>
        </div>
      </section>

      {/* Mobile sticky install bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <div className="min-w-0">
            {strikePrice && <p className="text-xs text-muted-foreground line-through">₹{strikePrice}</p>}
            <p className="text-lg font-bold text-foreground leading-none">₹{displayPrice}</p>
          </div>
          {renderBuyButton('flex-1')}
        </div>
      </div>

      {buying && (
        <PaymentModal
          isOpen={buying}
          onClose={() => setBuying(false)}
          onConfirm={handleConfirmPurchase}
          productName={product.name}
          price={displayPrice}
          gradientFrom={product.gradient_from}
          gradientTo={product.gradient_to}
          processing={processing}
        />
      )}
    </Layout>
  );
}
