import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { AIProductCard } from './AIProductCard';

interface Accent { h: number; s: number; l: number }

export interface HighlightItem {
  name: string;
  tagline: string;
  price: number;
  features: string[];
  badgeLabel: string;
  icon: LucideIcon;
  logoUrl?: string | null;
  accent: Accent;
  accent2: Accent;
  popular?: boolean;
}

interface AIHighlightProductsProps {
  items: HighlightItem[];
  processing: boolean;
  onBuy: (item: HighlightItem) => void;
}

/**
 * "Choose your assistant" — mirrors codeninjavik's 2-card Products section
 * (Jarvis + Myra), using the elaborate conic-ring ProductCard design.
 */
export function AIHighlightProducts({ items, processing, onBuy }: AIHighlightProductsProps) {
  return (
    <section id="ai-assistants" className="py-20 md:py-32 relative overflow-hidden scroll-mt-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full glass-card text-secondary font-semibold text-sm tracking-wider mb-4">
            CHOOSE YOUR ASSISTANT
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Meet <span className="glow-text">Your AI Team</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Two desktop assistants for your PC. Pick the one that fits how you work.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {items.map((item, i) => (
            <AIProductCard
              key={item.name}
              name={item.name}
              tagline={item.tagline}
              price={item.price}
              icon={item.icon}
              logoUrl={item.logoUrl}
              badgeLabel={item.badgeLabel}
              features={item.features}
              accent={item.accent}
              accent2={item.accent2}
              popular={item.popular}
              processing={processing}
              onBuy={() => onBuy(item)}
              delay={i * 0.1}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/ai#all-products">
            <GlowButton variant="outline" size="lg" className="group">
              <span>See All AI Products</span>
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </GlowButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
