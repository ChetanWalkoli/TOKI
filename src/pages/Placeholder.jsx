import { motion } from 'framer-motion';
import Companion from '../components/companion/Companion';
export default function Placeholder({ title, detail }) { return <motion.div className="page placeholder" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><Companion size="small" mood="idle" /><p className="eyebrow">A cozy corner is taking shape</p><h1>{title}</h1><p>{detail}</p></motion.div>; }
