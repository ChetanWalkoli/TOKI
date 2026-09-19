import { motion, useReducedMotion } from 'framer-motion';

const expressions = { idle: '⌣', excited: 'ᵕ', celebrating: 'ᴗ', thinking: '⌒', sleepy: '﹏', concerned: '⌢' };

export default function Companion({ mood = 'idle', size = 'large' }) {
  const reducedMotion = useReducedMotion();
  const active = mood === 'celebrating' || mood === 'excited';
  return <motion.div className={`companion companion-${size} mood-${mood}`} aria-label={`Toki is ${mood}`} role="img"
    animate={reducedMotion ? {} : active ? { y: [0, -12, 0], rotate: [0, -4, 4, 0] } : { y: [0, -5, 0] }}
    transition={{ duration: active ? .55 : 3.5, repeat: Infinity, repeatDelay: active ? .2 : 0, ease: 'easeInOut' }}>
    <span className="companion-spark spark-one">✦</span><span className="companion-spark spark-two">✦</span>
    <span className="companion-leaf" aria-hidden="true" />
    <span className="companion-arm arm-left" aria-hidden="true" /><span className="companion-arm arm-right" aria-hidden="true" />
    <div className="companion-face"><span className="eye" /><span className="eye" /><b>{expressions[mood] || expressions.idle}</b></div>
    <div className="companion-feet" aria-hidden="true"><i /><i /></div>
  </motion.div>;
}
