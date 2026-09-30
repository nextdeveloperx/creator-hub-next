import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, CheckCircle, Loader2, Coffee, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const emailSchema = z.string().trim().email({ message: 'Please enter a valid email' }).max(255);

export function Closing() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email: result.data });
      if (error) {
        if (error.code === '23505') toast.error("You're already subscribed!");
        else throw error;
      } else {
        await supabase.functions.invoke('send-welcome-email', { body: { email: result.data } });
        setSubscribed(true);
        toast.success("Welcome! You're now subscribed.");
        setEmail('');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="lp-section">
      <div className="container mx-auto">
        <div className="lp-glass relative overflow-hidden !rounded-[2.5rem] p-8 sm:p-12 lg:p-20">
          <div className="absolute -right-24 -top-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-40" style={{ background: 'var(--lp-grad)' }} aria-hidden="true" />

          <div className="relative grid lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-7">
              <h2 className="lp-h2 max-w-[14ch]">Build what is <span className="lp-gradient-text">next</span></h2>
              <p className="lp-lead mt-6 text-muted-foreground">Start with an assistant, grab a template, or back the work with a coffee.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/ai" className="lp-btn lp-btn-primary">
                  <Bot className="w-5 h-5" aria-hidden="true" />
                  Get an assistant
                </Link>
                <Link to="/support" className="lp-btn lp-btn-ghost">
                  <Coffee className="w-5 h-5" aria-hidden="true" />
                  Support me
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <h3 className="lp-title mb-3">Get new releases in your inbox</h3>
              {subscribed ? (
                <div className="flex items-center gap-3 p-5 rounded-2xl border" style={{ borderColor: 'hsl(var(--lp-cyan) / 0.5)', background: 'hsl(var(--lp-cyan) / 0.1)' }} role="status">
                  <CheckCircle className="w-6 h-6 shrink-0" style={{ color: 'hsl(var(--lp-cyan))' }} aria-hidden="true" />
                  <span className="font-medium">You are subscribed. Check your inbox soon.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <label htmlFor="lp-email" className="sr-only">Email address</label>
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                    <input
                      id="lp-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={submitting}
                      placeholder="you@example.com"
                      className="w-full h-[3.25rem] pl-12 pr-4 rounded-full bg-background/60 border border-border focus:border-[hsl(var(--lp-cyan))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--lp-cyan)/0.3)] placeholder:text-muted-foreground"
                    />
                  </div>
                  <button type="submit" disabled={submitting} className="lp-btn lp-btn-primary disabled:opacity-60 disabled:pointer-events-none">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Send className="w-5 h-5" aria-hidden="true" />}
                    {submitting ? 'Subscribing' : 'Subscribe'}
                  </button>
                </form>
              )}
              <p className="text-sm text-muted-foreground mt-4">No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
