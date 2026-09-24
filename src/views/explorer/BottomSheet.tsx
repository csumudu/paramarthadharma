'use client';

import { AnimatePresence, motion, useDragControls } from 'motion/react';
import type { PointerEvent, ReactNode } from 'react';

export function BottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const controls = useDragControls();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="bottom-sheet"
          role="dialog"
          aria-label="විස්තර"
          className="fixed inset-x-0 bottom-16 z-40 max-h-[70dvh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface px-4 pb-4 shadow-2xl md:hidden"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          drag="y"
          dragControls={controls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 100) onClose();
          }}
        >
          <div
            className="sticky top-0 z-10 -mx-4 flex touch-none items-center bg-surface px-4 py-2"
            onPointerDown={(e: PointerEvent) => controls.start(e)}
          >
            <div className="mx-auto h-1.5 w-12 rounded-full bg-line" aria-hidden />
            <button type="button" onClick={onClose} aria-label="වසන්න" className="absolute right-2 min-h-11 min-w-11 text-xl">
              ×
            </button>
          </div>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
