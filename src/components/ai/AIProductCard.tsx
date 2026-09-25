import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Check, ArrowRight, Loader2, Crown, Shield, LucideIcon } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { OfferBadge } from './OfferBadge';

interface Accent { h: number; s: number; l: number }

interface AIProductCardProps {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  icon: LucideIcon;
  logoUrl?: string | null;
  badgeLabel: string;
  features: string[];
  accent: Accent;
  accent2: Accent;
  popular?: boolean;
  onOffer?: boolean;
  processing?: boolean;
  onBuy: () => void;
  delay?: number;
}

/**
 * Premium product card — conic-gradient rotating ring, 3D mouse-tilt, floating
 * ambient orbs. Ported from codeninjavik's ProductCard, recolored per-product
 * (teal/cyan for Jarvis, violet/purple for Myra) instead of their red theme.
 */
export function AIProductCard({
  slug, name, tagline, price, icon: Icon, logoUrl, badgeLabel, features, accent, accent2,
  popular = false, onOffer = false, processing = false, onBuy, delay = 0,
}: AIProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 25 });
  const rotateX = useTransform(springY, [0, 1], [5, -5]);
  const rotateY = useTransform(springX, [0, 1], [-5, 5]);

  const hsl = `${accent.h} ${accent.s}% ${accent.l}%`;
  const hsl2 = `${accent2.h} ${accent2.s}% ${accent2.l}%`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0.5); mouseY.set(0.5); }}
      onClick={() => navigate(`/ai/${slug}`)}
      className="relative group rounded-3xl overflow-hidden transition-all duration-500 will-change-transform hover:-translate-y-2 cursor-pointer"
    >
      {onOffer && <OfferBadge className="-top-3 -left-3" />}
      <div className="absolute inset-0 rounded-3xl p-px overflow-hidden">
        <motion.div
          className="absolute inset-[-300%]"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{ background: `conic-gradient(from 0deg, hsla(${hsl}, 0.6), transparent 30%, hsla(${hsl2}, 0.4), transparent 60%, hsla(${hsl}, 0.6))` }}
        />
      </div>

      <div
        className="relative rounded-[calc(1.5rem-1px)] overflow-hidden m-px backdrop-blur-xl"
        style={{ background: `linear-gradient(170deg, hsla(${hsl}, 0.08) 0%, hsl(var(--card)) 30%, hsl(var(--background)) 100%)` }}
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: `radial-gradient(ellipse at 20% 0%, hsla(${hsl}, 0.15), transparent 50%), radial-gradient(ellipse at 80% 100%, hsla(${hsl2}, 0.1), transparent 50%)` }} />

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E\")" }} />

        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ background: `hsla(${hsl}, 0.15)`, width: `${60 + i * 20}px`, height: `${60 + i * 20}px`, left: `${10 + i * 30}%`, top: `${20 + (i % 2) * 40}%` }}
            animate={{ y: [0, -15, 0], x: [0, 8, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}

        {popular && (
          <div className="absolute -top-px left-1/2 -translate-x-1/2 z-20">
            <motion.div
              animate={{ boxShadow: [`0 4px 20px hsla(${hsl}, 0.3)`, `0 4px 40px hsla(${hsl}, 0.6)`, `0 4px 20px hsla(${hsl}, 0.3)`] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-8 py-2.5 rounded-b-2xl"
              style={{ background: `linear-gradient(135deg, hsl(${hsl}), hsl(${hsl2}))` }}
            >
              <span className="text-[10px] font-black text-white tracking-[0.25em] flex items-center gap-2">
                <Crown size={12} /> MOST POPULAR
              </span>
            </motion.div>
          </div>
        )}

        <div className="relative z-10 p-8 md:p-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.15em] mb-7 border backdrop-blur-md font-semibold"
            style={{ background: `hsla(${hsl}, 0.08)`, borderColor: `hsla(${hsl}, 0.2)`, color: `hsl(${hsl})` }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="w-[13px] h-[13px] rounded-sm object-cover" />
            ) : (
              <Icon size={13} />
            )}
            {badgeLabel}
          </motion.div>

          <h3 className="text-3xl md:text-4xl font-black mb-3 tracking-tight leading-tight" style={{ background: `linear-gradient(135deg, hsl(${hsl}), hsl(${hsl2}))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {name}
          </h3>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed max-w-[280px]">{tagline}</p>

          <div className="mb-2">
            <span
              className="text-5xl md:text-6xl font-black tracking-tighter"
              style={{ background: `linear-gradient(135deg, hsl(${hsl}), hsl(${hsl2}))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textShadow: `0 0 60px hsla(${hsl}, 0.25)` }}
            >
              ₹{price}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-8">
            <span className="text-[10px] font-black px-3 py-1.5 rounded-full border" style={{ background: `hsla(${hsl}, 0.06)`, borderColor: `hsla(${hsl}, 0.15)`, color: `hsl(${hsl})` }}>
              <Shield size={9} className="inline mr-1" />ONE-TIME PURCHASE
            </span>
          </div>

          <div className="h-px w-full mb-8" style={{ background: `linear-gradient(to right, transparent 5%, hsla(${hsl}, 0.2) 50%, transparent 95%)` }} />

          <ul className="space-y-3.5 mb-9">
            {features.map((feature, index) => (
              <motion.li
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: delay + index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-3 group/item"
              >
                <motion.div
                  whileHover={{ scale: 1.3, rotate: 10 }}
                  className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `linear-gradient(135deg, hsl(${hsl}), hsl(${hsl2}))`, boxShadow: `0 0 12px hsla(${hsl}, 0.3)` }}
                >
                  <Check size={11} className="text-white" strokeWidth={3} />
                </motion.div>
                <span className="text-foreground/70 text-sm leading-relaxed group-hover/item:text-foreground transition-colors duration-300">{feature}</span>
              </motion.li>
            ))}
          </ul>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={(e) => e.stopPropagation()}>
            <GlowButton onClick={onBuy} disabled={processing} className="w-full font-black tracking-wide rounded-2xl">
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', width: '40%' }}
              />
              {processing ? <Loader2 size={16} className="animate-spin relative z-10" /> : null}
              <span className="relative z-10">Buy {name} Now</span>
              <ArrowRight size={16} className="relative z-10" />
            </GlowButton>
          </motion.div>

          <p className="text-center text-[10px] text-muted-foreground mt-5 tracking-wider">
            ⚡ Instant delivery • ♾️ Lifetime access • 🔄 Free updates
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background: `linear-gradient(to top, hsla(${hsl}, 0.04), transparent)` }} />
      </div>
    </motion.div>
  );
}
