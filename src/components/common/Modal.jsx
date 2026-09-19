import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children }) {
  return <AnimatePresence>{open && (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
      <motion.section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" initial={{ opacity: 0, scale: .94, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .94, y: 18 }} transition={{ type: 'spring', duration: .35 }} onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button></header>
        {children}
      </motion.section>
    </motion.div>
  )}</AnimatePresence>;
}
