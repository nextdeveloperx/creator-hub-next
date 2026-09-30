import { motion } from 'framer-motion';
import { useLandingReducedMotion } from '@/hooks/useLandingMotion';
import { Code2, Gem, Cpu, Rocket } from 'lucide-react';

const SECTIONS = [
  {
    icon: Code2,
    title: 'What Next Developer offers',
    body: 'At NextDeveloper, we specialize in full-stack web development, cross-platform mobile app development, AI-powered tools, SaaS platforms, and developer-focused digital products. Our team combines clean engineering with thoughtful design so every project we ship is fast, scalable, and built to last. From landing pages to enterprise dashboards, Next Developer delivers code you can trust.',
  },
  {
    icon: Gem,
    title: 'Why choose NextDeveloper',
    body: "Next Developer (NextDeveloper) was founded with a simple belief — quality code shouldn't be a luxury. That's why we offer affordable templates, premium source codes, AI assistant starter kits, and end-to-end software services under one roof. Thousands of developers already rely on NextDeveloper for tutorials, project blueprints, and ready-to-deploy codebases that save weeks of work.",
  },
  {
    icon: Cpu,
    title: 'Web, app and AI development',
    body: 'As a modern development company, Next Developer focuses on the technologies businesses actually use today: React, Next.js, TypeScript, Tailwind CSS, Node.js, Supabase, and the latest AI APIs. NextDeveloper engineers craft responsive websites, performant mobile apps, and intelligent AI agents tailored to your brand. Every product we ship is mobile-first, SEO-optimized, and ready for real users from day one.',
  },
  {
    icon: Rocket,
    title: 'Built for creators and founders',
    body: "Beyond client work, Next Developer runs a thriving creator ecosystem — premium AI source codes (Jarvis, MYRA, ARIYA, Zara, AI Girlfriend), membership tiers, and a marketplace of templates. NextDeveloper is more than a software company; it's a platform built to help the next generation of developers learn, build, and grow. Join thousands who trust Next Developer (NextDeveloper) to power their digital journey.",
  },
];

export function About() {
  const reduce = useLandingReducedMotion();
  return (
    <section className="lp-section !pt-8" aria-labelledby="about-next-developer">
      <div className="container mx-auto">
        <div className="lp-glass !rounded-[2rem] p-6 sm:p-10 lg:p-14">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-14">
            <div className="lg:col-span-5">
              <h2 id="about-next-developer" className="lp-h2 !text-[clamp(1.9rem,3.4vw,3.2rem)]">
                About <span className="lp-gradient-text">Next Developer</span> <span className="text-muted-foreground font-medium">(NextDeveloper)</span>
              </h2>
            </div>
            <p className="lg:col-span-7 text-base sm:text-lg leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Next Developer</strong>, also known as <strong className="text-foreground">NextDeveloper</strong>, is a software and web development company building modern digital solutions for startups, creators, and enterprises around the world. Whether you spell it as Next Developer or NextDeveloper, our mission is the same — to help businesses ship faster with production-ready websites, mobile apps, AI assistants, and custom software.
            </p>
          </div>

          <div className="mt-10 lg:mt-14 grid md:grid-cols-2 gap-4 lg:gap-5">
            {SECTIONS.map((s, i) => (
              <motion.article
                key={s.title}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
                className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 transition-colors hover:border-white/25 hover:bg-white/[0.06]"
              >
                <span className="grid place-items-center w-12 h-12 rounded-2xl mb-5 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" style={{ background: 'var(--lp-grad)' }}>
                  <s.icon className="w-6 h-6 text-white" aria-hidden="true" />
                </span>
                <h3 className="lp-title mb-3">{s.title}</h3>
                <p className="text-[0.95rem] leading-[1.75] text-muted-foreground">{s.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
