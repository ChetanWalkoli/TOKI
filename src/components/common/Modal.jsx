import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.section
            className="relative w-full max-w-lg bg-[var(--color-paper-card)] rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--color-line)] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ type: 'spring', duration: 0.35 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-line-subtle)]">
              <h2 id="modal-title" className="font-['Fraunces'] font-semibold text-base text-[var(--color-ink)]">{title}</h2>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-paper-deep)] hover:text-[var(--color-ink)] transition-colors"
                aria-label="Close dialog"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </header>

            {/* Body */}
            <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
