import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

export function EaseOutComponent({ children }: { children: ReactNode }) {
  const MotionDiv = motion.div;
  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {children}
      </MotionDiv>
    </AnimatePresence>
  );
}
