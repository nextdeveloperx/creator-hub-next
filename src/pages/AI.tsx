import { Layout } from '@/components/layout/Layout';
import { Myra2FeaturesSection } from '@/components/ai/Myra2FeaturesSection';
import { AISourceCodeSection } from '@/components/ai/AISourceCodeSection';
import { PublishedMaterials } from '@/components/shared/PublishedMaterials';
import { PromoBanner } from '@/components/shared/PromoBanner';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Check, Loader2, Lock } from 'lucide-react';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useEffect, useRef, useState } from 'react';
import { PaymentModal } from '@/components/shop/PaymentModal';
import { AIHeroSection } from '@/components/ai/AIHeroSection';
import { AIInstallSection } from '@/components/ai/AIInstallSection';
import { AIAppDownloadSection } from '@/components/ai/AIAppDownloadSection';
import { AIPcDownloadSection } from '@/components/ai/AIPcDownloadSection';
import { AIFeaturesOverview } from '@/components/ai/AIFeaturesOverview';
import { AIHighlightProducts, HighlightItem } from '@/components/ai/AIHighlightProducts';
import { AITrustSection } from '@/components/ai/AITrustSection';
import { AIResourcesSection } from '@/components/ai/AIResourcesSection';
import { AIServicePromo } from '@/components/ai/AIServicePromo';
import { AIClosingCTA } from '@/components/ai/AIClosingCTA';
import { AICursorGlow } from '@/components/ai/AICursorGlow';
import { AIScrollProgress } from '@/components/ai/AIScrollProgress';
import { AISectionDivider } from '@/components/ai/AISectionDivider';
import { useAIProducts, AIProductRow } from '@/hooks/useAIProducts';
import { useActivePromotion, applyDiscount } from '@/hooks/useActivePromotion';
import { getIcon } from '@/lib/iconMap';

interface SelectedProduct {
  name: string;
  price: number;
  gradientFrom: string;
  gradientTo: string;
}

function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; r: number; dx: number; dy: number; alpha: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,200,255,${p.alpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

interface AICardProps {
  product: AIProductRow;
  displayPrice: number;
  strikePrice: number | null;
  index: number;
  onBuy: (product: AIProductRow, effectivePrice: number) => void;
  processing: boolean;
}

function AICard({ product, displayPrice, strikePrice, index, onBuy, processing }: AICardProps) {
  const Icon = getIcon(product.icon_name);
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(springY, [0, 1], [6, -6]);
  const rotateY = useTransform(springX, [0, 1], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || product.is_coming_soon) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={product.is_coming_soon ? {} : { scale: 1.04, y: -8 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0.5); mouseY.set(0.5); }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className="relative group"
    >
      <div
        className={`absolute -inset-0.5 rounded-2xl blur-lg transition-opacity duration-500 ${product.is_coming_soon ? 'opacity-20 animate-pulse' : 'opacity-30 group-hover:opacity-60'}`}
        style={{ background: `linear-gradient(135deg, ${product.gradient_from}, ${product.gradient_to})` }}
      />
      <div
        className={`relative h-full flex flex-col rounded-2xl border ${product.border_color} bg-card/60 backdrop-blur-xl p-6 overflow-hidden ${product.is_coming_soon ? 'opacity-70' : ''}`}
        style={product.is_coming_soon ? { filter: 'blur(0.5px)' } : {}}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${product.gradient_from}, ${product.gradient_to}, transparent)` }}
        />
        <span
          className="self-start text-[10px] font-bold tracking-widest px-3 py-1 rounded-full mb-4"
          style={{
            background: `linear-gradient(135deg, ${product.gradient_from}22, ${product.gradient_to}22)`,
            color: product.gradient_to,
            border: `1px solid ${product.gradient_from}44`,
          }}
        >
          {product.badge}
        </span>
        <div className="flex items-center gap-2 mb-1">
          {product.logo_url ? (
            <img src={product.logo_url} alt={product.name} className="w-5 h-5 rounded object-cover" />
          ) : (
            <span style={{ color: product.gradient_to }}><Icon className="w-5 h-5" /></span>
          )}
          <h3 className="text-2xl font-bold text-foreground">{product.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{product.subtitle}</p>
        <div className="mb-5">
          {strikePrice ? (
            <>
              <span className="text-lg text-muted-foreground line-through mr-2">₹{strikePrice}</span>
              <span className="text-3xl font-extrabold text-foreground">₹{displayPrice}</span>
              <span className="text-xs text-muted-foreground ml-2">(one-time)</span>
            </>
          ) : (
            <>
              <span className="text-3xl font-extrabold text-foreground">₹{displayPrice}</span>
              <span className="text-xs text-muted-foreground ml-2">(one-time)</span>
            </>
          )}
        </div>
        <ul className="space-y-2.5 mb-6 flex-1">
          {product.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 flex-shrink-0" style={{ color: product.gradient_to }} />
              {f}
            </li>
          ))}
        </ul>
        <motion.button
          whileTap={product.is_coming_soon ? {} : { scale: 0.96 }}
          disabled={processing || product.is_coming_soon}
          onClick={() => !product.is_coming_soon && onBuy(product, displayPrice)}
          className="w-full py-3 rounded-lg font-semibold text-sm text-white transition-shadow duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: product.is_coming_soon
              ? `linear-gradient(135deg, ${product.gradient_from}88, ${product.gradient_to}88)`
              : `linear-gradient(135deg, ${product.gradient_from}, ${product.gradient_to})`,
            boxShadow: `0 0 20px ${product.gradient_from}55`,
          }}
          onMouseEnter={(e) => {
            if (!product.is_coming_soon) (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 35px ${product.gradient_from}88`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${product.gradient_from}55`;
          }}
        >
          {product.is_coming_soon ? <Lock className="w-4 h-4" /> : processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {product.button_text}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function AI() {
  const { handlePurchaseWithDetails, processing } = useRazorpay();
  const { products, loading: productsLoading } = useAIProducts();
  const { promotion } = useActivePromotion('ai_products');
  // No auth required - direct purchase flow
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);

  const priceFor = (product: AIProductRow) => {
    const discounted = applyDiscount(product.price, promotion, product.id);
    const displayPrice = discounted < product.price ? discounted : product.price;
    const strikePrice = displayPrice < product.price ? product.price : (product.original_price ?? null);
    return { displayPrice, strikePrice };
  };

  const handleBuy = (product: AIProductRow, effectivePrice: number) => {
    setSelectedProduct({ name: product.name, price: effectivePrice, gradientFrom: product.gradient_from, gradientTo: product.gradient_to });
  };

  const handleConfirmPurchase = (name: string, mobile: string) => {
    if (!selectedProduct) return;
    handlePurchaseWithDetails({
      productName: selectedProduct.name,
      price: selectedProduct.price,
      userName: name,
      userMobile: mobile,
      themeColor: selectedProduct.gradientFrom,
    });
    setSelectedProduct(null);
  };

  const featuredProducts = products.filter((p) => p.is_featured);
  const highlightItems: HighlightItem[] = featuredProducts.map((p) => {
    const { displayPrice } = priceFor(p);
    return {
      name: p.name,
      tagline: p.subtitle,
      price: displayPrice,
      features: p.features,
      badgeLabel: p.badge,
      icon: getIcon(p.icon_name),
      logoUrl: p.logo_url,
      accent: hexToHsl(p.gradient_from),
      accent2: hexToHsl(p.gradient_to),
      popular: p.badge.toUpperCase().includes('POPULAR'),
    };
  });

  const handleHighlightBuy = (item: HighlightItem) => {
    const product = featuredProducts.find((p) => p.name === item.name);
    if (!product) return;
    handleBuy(product, item.price);
  };

  return (
    <Layout>
      <AIScrollProgress />
      <AICursorGlow />

      {/* Event / discount banner scoped to the AI section */}
      <PromoBanner scope="ai_products" />

      {/* All AI Assistants — prominent card showcase at the very top */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 rounded-full glass-card text-secondary font-semibold text-sm tracking-wider mb-4">
              ALL AI ASSISTANTS
            </span>
            <h2 className="text-3xl md:text-5xl font-bold">
              Explore Every <span className="glow-text">AI Assistant</span>
            </h2>
          </motion.div>
          {productsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 max-w-6xl mx-auto">
              {products.map((product, i) => {
                const { displayPrice, strikePrice } = priceFor(product);
                return (
                  <AICard key={product.id} product={product} displayPrice={displayPrice} strikePrice={strikePrice} index={i} onBuy={handleBuy} processing={processing} />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Hero — mirrors codeninjavik's home page hero */}
      <AIHeroSection />

      {/* Desktop install steps */}
      <AIInstallSection />
      <AISectionDivider />

      {/* Mobile app download */}
      <AIAppDownloadSection />

      {/* Free PC companion download */}
      <AIPcDownloadSection />
      <AISectionDivider variant="secondary" />

      {/* Features overview */}
      <AIFeaturesOverview />

      {/* Choose your assistant — featured highlight cards */}
      {highlightItems.length > 0 && (
        <AIHighlightProducts items={highlightItems} processing={processing} onBuy={handleHighlightBuy} />
      )}

      {/* Trust badges */}
      <AITrustSection />
      <AISectionDivider />

      {/* API resources for building on Jarvis/Myra */}
      <AIResourcesSection />

      {/* Custom AI build service promo */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <AIServicePromo />
        </div>
      </section>

      {/* Closing CTA */}
      <AIClosingCTA />

      <AISectionDivider />

      {/* Original hero content kept below as a secondary intro */}
      <section className="pt-16 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary blur-[150px]"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.03, 0.07, 0.03] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary blur-[130px]"
          />
        </div>
        <FloatingParticles />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            AI <span className="glow-text">Ecosystem</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Next Generation Intelligent Assistants
          </motion.p>
        </div>
      </section>

      {/* Intro */}
      <section className="pb-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold mb-4"
          >
            The Future of Personal AI Starts Here
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground leading-relaxed"
          >
            Explore our intelligent AI assistants designed to automate your life, enhance productivity, and deliver next-generation conversational experiences.
          </motion.p>
        </div>
      </section>

      {/* AI Products */}
      <section id="all-products" className="pb-24 relative overflow-hidden scroll-mt-24">
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-14 text-center"
          >
            Choose Your <span className="glow-text">AI Assistant</span>
          </motion.h2>
          {productsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 max-w-6xl mx-auto">
              {products.map((product, i) => {
                const { displayPrice, strikePrice } = priceFor(product);
                return (
                  <AICard key={product.id} product={product} displayPrice={displayPrice} strikePrice={strikePrice} index={i} onBuy={handleBuy} processing={processing} />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* AI Source Code Section */}
      <AISourceCodeSection />

      {/* AI Features Deep Breakdown */}
      <Myra2FeaturesSection />

      {/* Payment Modal */}
      {selectedProduct && (
        <PaymentModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={handleConfirmPurchase}
          productName={selectedProduct.name}
          price={selectedProduct.price}
          gradientFrom={selectedProduct.gradientFrom}
          gradientTo={selectedProduct.gradientTo}
          processing={processing}
        />
      )}
      <PublishedMaterials section="AI" title="AI Resources" subtitle="Tools and materials for AI development" />
    </Layout>
  );
}

/** Rough hex -> HSL conversion so DB-stored hex gradient colors can drive the AIProductCard's HSL-based glow effects. */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
