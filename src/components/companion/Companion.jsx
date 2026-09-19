import { motion, useReducedMotion } from 'framer-motion';

const expressions = {
  idle: { eyes: '● ●', mouth: '⌣', caption: 'Toki is resting' },
  happy: { eyes: '^ ^', mouth: '‿', caption: 'Toki is pleased' },
  thinking: { eyes: '• •', mouth: '⌒', caption: 'Toki is pondering' },
  working: { eyes: '⌐ ⌐', mouth: '—', caption: 'Toki is in focus' },
  celebrating: { eyes: '★ ★', mouth: 'ᗜ', caption: 'Toki is celebrating!' },
  sleepy: { eyes: '– –', mouth: 'o', caption: 'Toki is dozing off' },
};

export default function Companion({ mood = 'idle', size = 'large' }) {
  const reducedMotion = useReducedMotion();
  const safeMood = expressions[mood] ? mood : 'idle';
  const expr = expressions[safeMood];

  // Tailored micro-animations based on mascot mood
  let animation = { y: [0, -4, 0] };
  let transition = { duration: 3.5, repeat: Infinity, ease: 'easeInOut' };

  if (!reducedMotion) {
    if (safeMood === 'celebrating') {
      animation = { y: [0, -14, 0], rotate: [0, -6, 6, 0] };
      transition = { duration: 0.55, repeat: Infinity, repeatDelay: 0.2, ease: 'easeInOut' };
    } else if (safeMood === 'happy') {
      animation = { y: [0, -8, 0], scale: [1, 1.04, 1] };
      transition = { duration: 1.2, repeat: Infinity, ease: 'easeInOut' };
    } else if (safeMood === 'working') {
      animation = { y: [0, -2, 0], rotate: [0, 2, -2, 0] };
      transition = { duration: 1.8, repeat: Infinity, ease: 'easeInOut' };
    } else if (safeMood === 'thinking') {
      animation = { rotate: [0, 4, 0] };
      transition = { duration: 2.5, repeat: Infinity, ease: 'easeInOut' };
    } else if (safeMood === 'sleepy') {
      animation = { scale: [1, 0.98, 1], y: [0, 2, 0] };
      transition = { duration: 4.5, repeat: Infinity, ease: 'easeInOut' };
    }
  } else {
    animation = {};
  }

  return (
    <motion.div
      className={`companion companion-${size} mood-${safeMood}`}
      aria-label={expr.caption}
      role="img"
      animate={animation}
      transition={transition}
    >
      {/* Decorative mood accents */}
      {safeMood === 'celebrating' && (
        <>
          <span className="companion-spark spark-one" aria-hidden="true">✦</span>
          <span className="companion-spark spark-two" aria-hidden="true">★</span>
        </>
      )}

      {safeMood === 'sleepy' && (
        <span className="companion-zz" aria-hidden="true">z</span>
      )}

      {/* Head sprout / leaf */}
      <span className="companion-leaf" aria-hidden="true" />

      {/* Arms */}
      <span className={`companion-arm arm-left ${safeMood === 'working' ? 'arm-focused' : ''}`} aria-hidden="true" />
      <span className={`companion-arm arm-right ${safeMood === 'working' ? 'arm-focused' : ''}`} aria-hidden="true" />

      {/* Mascot face body */}
      <div className="companion-face">
        <span className="companion-eyes" aria-hidden="true">{expr.eyes}</span>
        <span className="companion-mouth" aria-hidden="true">{expr.mouth}</span>
      </div>

      {/* Mascot feet */}
      <div className="companion-feet" aria-hidden="true">
        <i />
        <i />
      </div>
    </motion.div>
  );
}
