import { Download } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { useToast } from '@/hooks/use-toast';

interface AdminExportProps {
  purchases: { product_name: string; amount: number; payment_status: string; created_at: string; user_id: string | null }[];
  profiles: { id: string; full_name: string | null; email: string | null; created_at: string | null }[];
  supporters: { name: string; email: string | null; amount: number; message: string | null; is_monthly: boolean | null; created_at: string }[];
  materials: { title: string; content_type: string; category: string | null; is_premium: boolean; price: number; download_count: number; rating: number; created_at: string }[];
}

/** Quote every cell and neutralise spreadsheet formulas (=, +, -, @) so exported customer text cannot run as one. */
function downloadCSV(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const cell = (c: string | number | null | undefined) => {
    let v = String(c ?? '');
    if (/^[=+\-@]/.test(v)) v = `'${v}`;
    return `"${v.replace(/"/g, '""')}"`;
  };
  const csv = [headers.join(','), ...rows.map((r) => r.map(cell).join(','))].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const date = (d: string | null) => (d ? new Date(d).toLocaleDateString('en-IN') : '');

export function AdminExport({ purchases, profiles, supporters, materials }: AdminExportProps) {
  const { toast } = useToast();

  const run = (label: string, count: number, fn: () => void) => {
    if (count === 0) {
      toast({ title: `No ${label} to export`, variant: 'destructive' });
      return;
    }
    fn();
    toast({ title: `${label} exported` });
  };

  const byId = new Map(profiles.map((p) => [p.id, p]));

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <GlowButton size="sm" variant="outline" onClick={() => run('purchases', purchases.length, () =>
        downloadCSV('purchases.csv', ['Product', 'Amount', 'Status', 'Customer', 'Email', 'Date'],
          purchases.map((p) => {
            const u = p.user_id ? byId.get(p.user_id) : undefined;
            return [p.product_name, p.amount, p.payment_status, u?.full_name, u?.email, date(p.created_at)];
          })))}>
        <Download className="w-4 h-4" /> Purchases
      </GlowButton>
      <GlowButton size="sm" variant="outline" onClick={() => run('customers', profiles.length, () =>
        downloadCSV('customers.csv', ['Name', 'Email', 'Joined'], profiles.map((p) => [p.full_name, p.email, date(p.created_at)])))}>
        <Download className="w-4 h-4" /> Customers
      </GlowButton>
      <GlowButton size="sm" variant="outline" onClick={() => run('supporters', supporters.length, () =>
        downloadCSV('supporters.csv', ['Name', 'Email', 'Amount', 'Message', 'Monthly', 'Date'],
          supporters.map((s) => [s.name, s.email, s.amount, s.message, s.is_monthly ? 'Yes' : 'No', date(s.created_at)])))}>
        <Download className="w-4 h-4" /> Supporters
      </GlowButton>
      <GlowButton size="sm" variant="outline" onClick={() => run('materials', materials.length, () =>
        downloadCSV('materials.csv', ['Title', 'Type', 'Category', 'Premium', 'Price', 'Downloads', 'Rating', 'Date'],
          materials.map((m) => [m.title, m.content_type, m.category, m.is_premium ? 'Yes' : 'No', m.price, m.download_count, m.rating, date(m.created_at)])))}>
        <Download className="w-4 h-4" /> Materials
      </GlowButton>
    </div>
  );
}
