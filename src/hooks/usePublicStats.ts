import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublicStats {
  users: number;
  members: number;
  sales: number;
  byProduct: Record<string, number>;
}

const EMPTY: PublicStats = { users: 0, members: 0, sales: 0, byProduct: {} };

// One request per page load, shared by every component that shows a live number.
let pending: Promise<PublicStats> | null = null;

function fetchStats(): Promise<PublicStats> {
  if (!pending) {
    pending = Promise.resolve(supabase.rpc('get_public_stats')).then(({ data, error }) => {
      if (error || !data) return EMPTY;
      const d = data as { users?: number; members?: number; sales?: number; by_product?: Record<string, number> };
      return { users: d.users ?? 0, members: d.members ?? 0, sales: d.sales ?? 0, byProduct: d.by_product ?? {} };
    });
  }
  return pending;
}

/**
 * Real counts from the database. The site shows these ON TOP of its base figures
 * (e.g. 1,200 + registered users), so the numbers grow as real users join.
 * `ready` flips once the request finishes, so count-up animations can start from the final value.
 */
export function usePublicStats() {
  const [stats, setStats] = useState<PublicStats>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchStats().then((s) => {
      if (!cancelled) { setStats(s); setReady(true); }
    });
    return () => { cancelled = true; };
  }, []);

  return { stats, ready };
}
