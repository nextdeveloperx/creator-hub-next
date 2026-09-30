import { useEffect, useId, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Coffee, Heart, ShieldCheck, Zap, Repeat, Video, Code2, Package, GraduationCap,
  Users, Star, Clock, Loader2, BadgeCheck,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Aurora } from '@/components/landing/Aurora';
import { AnimatedStat } from '@/components/home/AnimatedStat';
import { PublishedMaterials } from '@/components/shared/PublishedMaterials';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useLandingReducedMotion } from '@/hooks/useLandingMotion';
import { usePublicStats } from '@/hooks/usePublicStats';
import logo from '/logo.png';
import '@/styles/landing.css';

const PRESETS = [
  { amount: 99, label: '1 coffee' },
  { amount: 199, label: '2 coffees' },
  { amount: 499, label: '5 coffees' },
  { amount: 999, label: '10 coffees' },
];

const FUNDS = [
  { icon: Video, title: 'Video tutorials', desc: 'Step-by-step builds you can follow along.' },
  { icon: Code2, title: 'Open source', desc: 'Tools and starter code that stay free.' },
  { icon: Package, title: 'Free resources', desc: 'Templates and guides for the community.' },
  { icon: GraduationCap, title: 'Mentorship', desc: 'Time to answer questions and review work.' },
];


const MAX_AMOUNT = 100000;

type Errors = { name?: string; mobile?: string; amount?: string };

export default function Support() {
  const reduce = useLandingReducedMotion();
  const uid = useId();
  const { stats: live, ready } = usePublicStats();
  // Base figures; "Developers helped" grows with every real signup.
  const IMPACT = [
    { icon: Users, label: 'Developers helped', value: `${50 + live.users}+` },
    { icon: Zap, label: 'Projects created', value: '10+' },
    { icon: Star, label: 'Resources shared', value: '25+' },
    { icon: Clock, label: 'Hours of content', value: '100+' },
  ];
  const [amount, setAmount] = useState(199);
  const [customAmount, setCustomAmount] = useState('');
  const [monthly, setMonthly] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const { handlePurchaseWithDetails, processing } = useRazorpay();

  // Same wide layout + footer stacking as the home page
  useEffect(() => {
    document.documentElement.classList.add('nd-wide');
    return () => document.documentElement.classList.remove('nd-wide');
  }, []);

  const coffees = Math.max(1, Math.round(amount / 99));
  const isPreset = PRESETS.some((p) => p.amount === amount) && customAmount === '';

  const validate = (): Errors => {
    const e: Errors = {};
    if (!name.trim()) e.name = 'Enter your name.';
    if (!/^\d{10}$/.test(mobile.trim())) e.mobile = 'Enter a 10-digit mobile number.';
    if (!Number.isFinite(amount) || amount < 1) e.amount = 'Enter an amount of at least ₹1.';
    else if (amount > MAX_AMOUNT) e.amount = `The maximum is ₹${MAX_AMOUNT.toLocaleString('en-IN')}.`;
    return e;
  };

  const handleSupport = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      document.getElementById(`${uid}-${e.amount ? 'amount' : e.name ? 'name' : 'mobile'}`)?.focus();
      return;
    }
    const label = monthly ? `Monthly Support - ₹${amount}` : `One-time Support - ₹${amount}`;
    handlePurchaseWithDetails({ productName: label, price: amount, userName: name.trim(), userMobile: mobile.trim() });
  };

  const pickPreset = (value: number) => {
    setAmount(value);
    setCustomAmount('');
    setErrors((e) => ({ ...e, amount: undefined }));
  };

  const onCustom = (raw: string) => {
    const clean = raw.replace(/\D/g, '').slice(0, 6);
    setCustomAmount(clean);
    setAmount(clean ? Number(clean) : 0);
    setErrors((e) => ({ ...e, amount: undefined }));
  };

  const field = 'w-full h-12 rounded-xl border bg-background/60 px-4 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--lp-cyan))] transition-colors';

  return (
    <Layout>
      <div className="lp">
        <Aurora />

        <section className="pt-14 pb-20 lg:pt-20 lg:pb-28">
          <div className="container mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Story */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <p className="lp-glass !rounded-full inline-flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground">
                  <Coffee className="w-4 h-4 text-[hsl(var(--lp-cyan))]" aria-hidden="true" />
                  Buy me a coffee
                </p>
                <h1 className="lp-display mt-6 text-[clamp(2.6rem,6vw,5rem)]">
                  Support the <span className="lp-gradient-text">work</span>
                </h1>
                <p className="lp-lead mt-6 text-muted-foreground">
                  Your support pays for free tutorials, open-source tools and resources for developers who are just getting started.
                </p>
              </motion.div>

              <h2 className="lp-title mt-10 mb-4">What your support funds</h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {FUNDS.map((f, i) => (
                  <motion.li
                    key={f.title}
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.07, duration: 0.5 }}
                    className="lp-glass !rounded-2xl p-4 flex gap-3"
                  >
                    <span className="grid place-items-center w-10 h-10 rounded-xl shrink-0" style={{ background: 'var(--lp-grad)' }}>
                      <f.icon className="w-5 h-5 text-white" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-bold text-sm">{f.title}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</span>
                    </span>
                  </motion.li>
                ))}
              </ul>

              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-foreground/10 pt-8">
                {IMPACT.map((s, i) => (
                  <div key={`${s.label}-${ready}`}>
                    <AnimatedStat icon={s.icon} value={s.value} label={s.label} delay={i * 150} />
                  </div>
                ))}
              </dl>
            </div>

            {/* Payment card */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7"
            >
              <form
                onSubmit={(e) => { e.preventDefault(); handleSupport(); }}
                noValidate
                className="lp-glass !rounded-[2rem] overflow-hidden"
              >
                <div className="h-1.5" style={{ background: 'var(--lp-grad)' }} aria-hidden="true" />

                <div className="p-6 sm:p-9 space-y-8">
                  <div className="flex items-center gap-4">
                    <img src={logo} alt="" className="w-14 h-14 rounded-full ring-2 ring-[hsl(var(--lp-violet))] ring-offset-2 ring-offset-card" />
                    <div className="min-w-0">
                      <p className="font-bold text-lg flex items-center gap-1.5">
                        Next Developer
                        <BadgeCheck className="w-5 h-5 text-[hsl(var(--lp-cyan))]" aria-label="Verified creator" />
                      </p>
                      <p className="text-sm text-muted-foreground">Full-stack developer and creator</p>
                    </div>
                  </div>

                  {/* One-time / Monthly */}
                  <fieldset>
                    <legend className="text-sm font-bold mb-3">How often?</legend>
                    <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-foreground/[0.06]" role="radiogroup">
                      {[
                        { value: false, label: 'One-time', icon: Coffee },
                        { value: true, label: 'Monthly', icon: Repeat },
                      ].map((o) => {
                        const on = monthly === o.value;
                        return (
                          <button
                            key={o.label}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => setMonthly(o.value)}
                            className={`h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--lp-cyan))] ${
                              on ? 'text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
                            }`}
                            style={on ? { background: 'var(--lp-grad)' } : undefined}
                          >
                            <o.icon className="w-4 h-4" aria-hidden="true" />
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                    {monthly && (
                      <p className="text-xs text-muted-foreground mt-2">Helps me plan ahead. You pay for one month at a time.</p>
                    )}
                  </fieldset>

                  {/* Amount */}
                  <fieldset>
                    <legend className="text-sm font-bold mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[hsl(var(--lp-pink))]" aria-hidden="true" /> Choose an amount
                    </legend>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="radiogroup" aria-label="Preset amounts">
                      {PRESETS.map((p) => {
                        const on = amount === p.amount && customAmount === '';
                        return (
                          <button
                            key={p.amount}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => pickPreset(p.amount)}
                            className={`relative rounded-2xl border-2 px-3 py-4 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--lp-cyan))] ${
                              on
                                ? 'border-[hsl(var(--lp-violet))] bg-[hsl(var(--lp-violet)/0.12)] -translate-y-0.5 shadow-lg'
                                : 'border-foreground/10 bg-foreground/[0.03] hover:border-foreground/30'
                            }`}
                          >
                            <span className="block text-xl font-black tabular-nums">₹{p.amount}</span>
                            <span className="block text-xs text-muted-foreground mt-0.5">{p.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 relative">
                      <label htmlFor={`${uid}-amount`} className="sr-only">Custom amount in rupees</label>
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">₹</span>
                      <input
                        id={`${uid}-amount`}
                        inputMode="numeric"
                        value={customAmount}
                        onChange={(e) => onCustom(e.target.value)}
                        placeholder="Or type your own amount"
                        aria-invalid={!!errors.amount}
                        aria-describedby={errors.amount ? `${uid}-amount-err` : undefined}
                        className={`${field} pl-9 ${errors.amount ? 'border-destructive' : 'border-foreground/15'}`}
                      />
                    </div>
                    {errors.amount && <p id={`${uid}-amount-err`} role="alert" className="text-sm text-destructive mt-2">{errors.amount}</p>}
                    {!errors.amount && amount >= 1 && (
                      <p className="text-sm text-muted-foreground mt-2" aria-live="polite">
                        {isPreset || customAmount ? `That is about ${coffees} ${coffees === 1 ? 'coffee' : 'coffees'}. Thank you!` : ''}
                      </p>
                    )}
                  </fieldset>

                  {/* Details */}
                  <div className="space-y-5">
                    <h2 className="text-sm font-bold">Your details</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`${uid}-name`} className="block text-sm mb-1.5">Name <span className="text-destructive" aria-hidden="true">*</span></label>
                        <input
                          id={`${uid}-name`}
                          autoComplete="name"
                          value={name}
                          onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined })); }}
                          placeholder="Your name"
                          required
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? `${uid}-name-err` : undefined}
                          className={`${field} ${errors.name ? 'border-destructive' : 'border-foreground/15'}`}
                        />
                        {errors.name && <p id={`${uid}-name-err`} role="alert" className="text-sm text-destructive mt-1.5">{errors.name}</p>}
                      </div>
                      <div>
                        <label htmlFor={`${uid}-mobile`} className="block text-sm mb-1.5">Mobile number <span className="text-destructive" aria-hidden="true">*</span></label>
                        <input
                          id={`${uid}-mobile`}
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          value={mobile}
                          onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors((x) => ({ ...x, mobile: undefined })); }}
                          placeholder="10-digit number"
                          required
                          aria-invalid={!!errors.mobile}
                          aria-describedby={errors.mobile ? `${uid}-mobile-err` : undefined}
                          className={`${field} ${errors.mobile ? 'border-destructive' : 'border-foreground/15'}`}
                        />
                        {errors.mobile && <p id={`${uid}-mobile-err`} role="alert" className="text-sm text-destructive mt-1.5">{errors.mobile}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor={`${uid}-email`} className="block text-sm mb-1.5">Email <span className="text-muted-foreground">(optional)</span></label>
                      <input id={`${uid}-email`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={`${field} border-foreground/15`} />
                    </div>

                    <div>
                      <label htmlFor={`${uid}-msg`} className="block text-sm mb-1.5">Message <span className="text-muted-foreground">(optional)</span></label>
                      <textarea
                        id={`${uid}-msg`}
                        rows={3}
                        maxLength={300}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Say something nice"
                        className="w-full rounded-xl border border-foreground/15 bg-background/60 px-4 py-3 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--lp-cyan))]"
                      />
                    </div>
                  </div>

                  <div>
                    <button type="submit" disabled={processing} className="lp-btn lp-btn-primary w-full !min-h-[3.75rem] text-base disabled:opacity-60 disabled:pointer-events-none">
                      {processing ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Heart className="w-5 h-5" fill="currentColor" aria-hidden="true" />}
                      {processing ? 'Opening secure checkout' : `Support with ₹${amount >= 1 ? amount.toLocaleString('en-IN') : '…'}${monthly ? ' / month' : ''}`}
                    </button>

                    <ul className="mt-5 flex flex-wrap items-center justify-center gap-2">
                      {[
                        { icon: ShieldCheck, text: 'Secure payment' },
                        { icon: Zap, text: 'Instant confirmation' },
                        { icon: BadgeCheck, text: 'Powered by Razorpay' },
                      ].map((t) => (
                        <li key={t.text} className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1.5 rounded-full border border-foreground/10">
                          <t.icon className="w-3.5 h-3.5 text-[hsl(var(--lp-cyan))]" aria-hidden="true" /> {t.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </form>

              <figure className="mt-8 text-center max-w-md mx-auto">
                <blockquote className="text-sm text-muted-foreground italic leading-relaxed">
                  “Every contribution, no matter how small, helps me keep creating free resources and tools for developers worldwide.”
                </blockquote>
                <figcaption className="text-xs text-muted-foreground mt-2">Next Developer</figcaption>
              </figure>
            </motion.div>
          </div>
        </section>

        <PublishedMaterials section="Support" title="Support Resources" subtitle="Helpful materials and guides" />
      </div>
    </Layout>
  );
}
