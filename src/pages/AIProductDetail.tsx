import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Loader2, Lock } from 'lucide-react';
import { useAIProduct } from '@/hooks/useAIProducts';
import { useActivePromotion, applyDiscount } from '@/hooks/useActivePromotion';
import { useRazorpay } from '@/hooks/useRazorpay';
import { getIcon } from '@/lib/iconMap';
import { PaymentModal } from '@/components/shop/PaymentModal';
import { OfferBadge } from '@/components/ai/OfferBadge';

export default function AIProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { product, loading } = useAIProduct(slug);
  const { promotion } = useActivePromotion('ai_products');
  const { handlePurchaseWithDetails, processing } = useRazorpay();
  const [buying, setBuying] = useState(false);

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

  return (
    <Layout>
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/ai')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to AI Assistants
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            {onOffer && <OfferBadge className="-top-3 -left-3" />}
            <div
              className={`absolute -inset-0.5 rounded-2xl blur-lg opacity-30 ${product.is_coming_soon ? 'animate-pulse' : ''}`}
              style={{ background: `linear-gradient(135deg, ${product.gradient_from}, ${product.gradient_to})` }}
            />
            <div className={`relative rounded-2xl border ${product.border_color} bg-card/60 backdrop-blur-xl p-6 md:p-10 overflow-hidden`}>
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${product.gradient_from}, ${product.gradient_to}, transparent)` }}
              />

              <span
                className="inline-block text-[10px] font-bold tracking-widest px-3 py-1 rounded-full mb-5"
                style={{
                  background: `linear-gradient(135deg, ${product.gradient_from}22, ${product.gradient_to}22)`,
                  color: product.gradient_to,
                  border: `1px solid ${product.gradient_from}44`,
                }}
              >
                {product.badge}
              </span>

              <div className="flex items-center gap-3 mb-2">
                {product.logo_url ? (
                  <img src={product.logo_url} alt={product.name} className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${product.gradient_from}, ${product.gradient_to})` }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">{product.name}</h1>
              </div>
              <p className="text-muted-foreground mb-6">{product.subtitle}</p>

              {product.banner_url && (
                <div className="rounded-xl overflow-hidden mb-6 border border-border/50">
                  <img src={product.banner_url} alt={product.name} className="w-full max-h-72 object-cover" />
                </div>
              )}

              <div className="mb-6">
                {strikePrice ? (
                  <>
                    <span className="text-xl text-muted-foreground line-through mr-2">₹{strikePrice}</span>
                    <span className="text-4xl font-extrabold text-foreground">₹{displayPrice}</span>
                    <span className="text-xs text-muted-foreground ml-2">(one-time)</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-extrabold text-foreground">₹{displayPrice}</span>
                    <span className="text-xs text-muted-foreground ml-2">(one-time)</span>
                  </>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {product.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: product.gradient_to }} />
                    {f}
                  </li>
                ))}
              </ul>

              <motion.button
                whileTap={product.is_coming_soon ? {} : { scale: 0.97 }}
                disabled={processing || product.is_coming_soon}
                onClick={() => !product.is_coming_soon && setBuying(true)}
                className="w-full sm:w-auto px-10 py-3.5 rounded-lg font-semibold text-sm text-white transition-shadow duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: product.is_coming_soon
                    ? `linear-gradient(135deg, ${product.gradient_from}88, ${product.gradient_to}88)`
                    : `linear-gradient(135deg, ${product.gradient_from}, ${product.gradient_to})`,
                  boxShadow: `0 0 20px ${product.gradient_from}55`,
                }}
              >
                {product.is_coming_soon ? <Lock className="w-4 h-4" /> : processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {product.button_text}
              </motion.button>

              <p className="text-xs text-muted-foreground mt-4">⚡ Instant delivery • ♾️ Lifetime access • 🔄 Free updates</p>
            </div>
          </motion.div>
        </div>
      </section>

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
