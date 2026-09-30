import { motion } from 'framer-motion';
import { AdminPageSectionsSection } from '@/components/admin/AdminPageSectionsSection';

export default function AdminPageSections() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <AdminPageSectionsSection />
    </motion.div>
  );
}
