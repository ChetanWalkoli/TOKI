import { motion } from 'framer-motion';
import { ArrowRight, Plus } from 'lucide-react';
import Companion from '../components/companion/Companion';
import TaskList from '../components/tasks/TaskList';
import { getGreeting } from '../utils/task';

const messages = { idle: 'One thing at a time.', created: 'Good. It’s on the page now.', completed: 'Nice. That’s done.', edited: 'A little clearer now.', deleted: 'Out of the way.', reopened: 'Back when you’re ready.' };
export default function Dashboard({ todos, onAdd, onEdit }) {
  const { tasks, stats, lastAction, toggleTask, deleteTask } = todos;
  const greeting = getGreeting();
  const mood = lastAction === 'completed' ? 'celebrating' : lastAction === 'created' ? 'excited' : 'idle';
  const today = tasks.filter((task) => task.dueDate === new Date().toISOString().slice(0, 10));
  const remaining = tasks.filter((task) => !task.completed);
  return <motion.div className="page dashboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
    <section className="notebook-intro"><div><p className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p><p className="greeting">{greeting.title} {greeting.icon}</p><h1>Let’s make some<br /><em>progress.</em></h1><p className="companion-message">{messages[lastAction] || messages.idle}</p></div><div className="toki-corner"><Companion mood={mood} /><span className="toki-caption">Toki is here.</span></div></section>
    <section className="daily-progress"><div><span className="eyebrow">Today</span><p><strong>{stats.complete}</strong> done <i /> <strong>{remaining.length}</strong> left</p></div><div className="progress-wrap"><span>{stats.complete} / {stats.total}</span><div className="progress-track"><motion.i initial={{ width: 0 }} animate={{ width: `${stats.percent}%` }} /></div></div></section>
    <section className="tasks-section"><div className="section-heading"><div><p className="eyebrow">Today</p><h2>What’s on the list</h2></div><button className="text-button" onClick={onAdd}><Plus size={15} /> What needs doing?</button></div><TaskList tasks={today} onToggle={toggleTask} onEdit={onEdit} onDelete={deleteTask} /></section>
    {remaining.some((task) => task.dueDate !== new Date().toISOString().slice(0, 10)) && <section className="tasks-section up-next"><div className="section-heading"><div><p className="eyebrow">Up next</p><h2>When you’re ready</h2></div><button className="text-button">See all <ArrowRight size={16} /></button></div><TaskList tasks={remaining.filter((task) => task.dueDate !== new Date().toISOString().slice(0, 10))} onToggle={toggleTask} onEdit={onEdit} onDelete={deleteTask} /></section>}
  </motion.div>;
}
