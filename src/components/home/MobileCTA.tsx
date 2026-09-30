import { Link, useLocation } from 'react-router-dom';
import { Bot, Crown, Package } from 'lucide-react';

const ITEMS = [
  { to: '/membership', label: 'Membership', icon: Crown },
  { to: '/ai', label: 'AI', icon: Bot },
  { to: '/shop', label: 'Shop', icon: Package },
];

/** Thumb-reach shortcuts on phones. Floats above the bottom edge so gesture bars never clip it. */
export function MobileCTA() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Quick actions"
      className="md:hidden fixed inset-x-3 z-50 bottom-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <ul className="grid grid-cols-3 gap-1 rounded-full border border-border bg-card/90 p-1.5 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(`${to}/`);
          return (
            <li key={to}>
              <Link
                to={to}
                aria-current={active ? 'page' : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(188_95%_58%)] ${
                  active
                    ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white'
                    : 'text-foreground/75 active:bg-foreground/10'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
