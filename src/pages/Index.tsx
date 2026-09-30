import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Aurora } from '@/components/landing/Aurora';
import { Hero } from '@/components/landing/Hero';
import { Stats } from '@/components/landing/Stats';
import { TechMarquee } from '@/components/landing/TechMarquee';
import { Bento } from '@/components/landing/Bento';
import { Assistants } from '@/components/landing/Assistants';
import { Process } from '@/components/landing/Process';
import { Membership } from '@/components/landing/Membership';
import { Story } from '@/components/landing/Story';
import { Voices } from '@/components/landing/Voices';
import { Roadmap } from '@/components/landing/Roadmap';
import { Closing } from '@/components/landing/Closing';
import { About } from '@/components/landing/About';
import { MobileCTA } from '@/components/home/MobileCTA';
import { PublishedMaterials } from '@/components/shared/PublishedMaterials';
import '@/styles/landing.css';

export default function Index() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });

  // Lets the shared navbar/footer follow the wider home layout
  useEffect(() => {
    document.documentElement.classList.add('nd-wide');
    return () => document.documentElement.classList.remove('nd-wide');
  }, []);

  return (
    <Layout>
      <motion.div
        className="fixed top-0 inset-x-0 h-[3px] z-[60] origin-left"
        style={{ scaleX: progress, background: 'linear-gradient(90deg, hsl(252 100% 72%), hsl(168 90% 58%))' }}
        aria-hidden="true"
      />
      <div className="lp">
        <Aurora />
        <Hero />
        <Stats />
        <TechMarquee />
        <Bento />
        <Assistants />
        <Process />
        <Membership />
        <Story />
        <Voices />
        <Roadmap />
        <PublishedMaterials section="Home" title="Featured Materials" subtitle="Explore our latest resources and templates" />
        <Closing />
        <About />
        <div className="h-20 md:hidden" />
      </div>
      <MobileCTA />
    </Layout>
  );
}
