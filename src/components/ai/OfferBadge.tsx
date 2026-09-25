import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

/** Pulsing "on offer" ribbon, dropped onto a `relative` card to flag it as pinned/discounted. */
export function OfferBadge({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      className={`absolute z-20 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-wider text-white bg-gradient-to-r from-red-500 to-orange-500 ${className}`}
    >
      <motion.span
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        className="flex"
      >
        <Flame className="w-3 h-3" />
      </motion.span>
      OFFER
      <motion.span
        className="absolute inset-0 rounded-full -z-10"
        animate={{ boxShadow: ['0 0 0px rgba(239,68,68,0.5)', '0 0 16px rgba(239,68,68,0.65)', '0 0 0px rgba(239,68,68,0.5)'] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
