import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Layout } from '@/components/layout/Layout';
import { NavLink } from '@/components/NavLink';
import { motion } from 'framer-motion';
import { LayoutDashboard, Sparkles, DownloadCloud, Megaphone, FileText, ShoppingBag } from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/materials', label: 'Materials', icon: FileText },
  { to: '/admin/shop-products', label: 'Shop Products', icon: ShoppingBag },
  { to: '/admin/ai-products', label: 'AI Products', icon: Sparkles },
  { to: '/admin/app-releases', label: 'App Releases', icon: DownloadCloud },
  { to: '/admin/promotions', label: 'Promotions & Offers', icon: Megaphone },
];

/** Shared sidebar + auth guard for every /admin/* route. */
export function AdminSidebarLayout() {
  const { user, isAdmin, loading, adminChecked } = useAuth();
  const navigate = useNavigate();
  const settled = !loading && adminChecked;

  useEffect(() => {
    if (settled && (!user || !isAdmin)) navigate('/');
  }, [user, isAdmin, settled, navigate]);

  if (!settled || !isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-64 shrink-0"
            >
              <div className="glass-card p-3 lg:sticky lg:top-24">
                <h2 className="text-xs font-semibold text-muted-foreground tracking-wider px-3 py-2">ADMIN</h2>
                <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors whitespace-nowrap"
                      activeClassName="bg-primary/15 text-primary hover:bg-primary/15 hover:text-primary"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </motion.aside>

            <div className="flex-1 min-w-0">
              <Outlet />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
