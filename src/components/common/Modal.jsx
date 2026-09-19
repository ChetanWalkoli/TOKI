import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, size = 'md', children }) {
  const sizeCls = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
  }[size] || 'max-w-lg';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.section
            className={`relative w-full ${sizeCls} bg-[var(--color-paper-card)] rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--color-line)] overflow-hidden my-auto`}
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
            <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[var(--color-line-subtle)]">
              <h2 id="modal-title" className="font-['Fraunces'] font-semibold text-base sm:text-lg text-[var(--color-ink)]">{title}</h2>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-paper-deep)] hover:text-[var(--color-ink)] transition-colors"
                aria-label="Close dialog"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </header>

            {/* Body */}
            <div className="px-4 sm:px-6 py-5 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
