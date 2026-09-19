import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  CheckSquare,
  Home,
  CalendarDays,
  Sunrise,
  Kanban,
  Calendar,
  Timer,
  BarChart3,
  Settings,
  Plus,
  Moon,
  Sun,
  Keyboard,
  ArrowRight,
} from 'lucide-react';

export default function CommandPalette({
  open,
  onClose,
  tasks = [],
  onOpenAdd,
  onEditTask,
  theme,
  onToggleTheme,
  onOpenShortcuts,
}) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const baseCommands = [
    { id: 'cmd-new', title: 'Create new task', category: 'Actions', icon: Plus, action: () => { onClose(); onOpenAdd(); } },
    { id: 'cmd-focus', title: 'Start Focus Mode (Pomodoro)', category: 'Actions', icon: Timer, action: () => { onClose(); navigate('/focus'); } },
    { id: 'cmd-theme', title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`, category: 'Actions', icon: theme === 'dark' ? Sun : Moon, action: () => { onClose(); onToggleTheme(); } },
    { id: 'cmd-shortcuts', title: 'View Keyboard Shortcuts', category: 'Help', icon: Keyboard, action: () => { onClose(); onOpenShortcuts(); } },
    { id: 'nav-dashboard', title: 'Go to Dashboard', category: 'Navigation', icon: Home, action: () => { onClose(); navigate('/'); } },
    { id: 'nav-tasks', title: 'Go to Tasks', category: 'Navigation', icon: CheckSquare, action: () => { onClose(); navigate('/tasks'); } },
    { id: 'nav-kanban', title: 'Go to Kanban Board', category: 'Navigation', icon: Kanban, action: () => { onClose(); navigate('/board'); } },
    { id: 'nav-today', title: 'Go to Today', category: 'Navigation', icon: CalendarDays, action: () => { onClose(); navigate('/today'); } },
    { id: 'nav-upcoming', title: 'Go to Upcoming', category: 'Navigation', icon: Sunrise, action: () => { onClose(); navigate('/upcoming'); } },
    { id: 'nav-calendar', title: 'Go to Calendar', category: 'Navigation', icon: Calendar, action: () => { onClose(); navigate('/calendar'); } },
    { id: 'nav-analytics', title: 'Go to Analytics & Streaks', category: 'Navigation', icon: BarChart3, action: () => { onClose(); navigate('/analytics'); } },
    { id: 'nav-settings', title: 'Go to Settings', category: 'Navigation', icon: Settings, action: () => { onClose(); navigate('/settings'); } },
  ];

  const matchingTasks = search.trim()
    ? tasks
        .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 5)
        .map((task) => ({
          id: `task-${task.id}`,
          title: task.title,
          category: 'Tasks',
          icon: CheckSquare,
          badge: task.completed ? 'Completed' : task.priority,
          action: () => { onClose(); onEditTask(task); },
        }))
    : [];

  const filteredCommands = search.trim()
    ? [...baseCommands.filter((cmd) => cmd.title.toLowerCase().includes(search.toLowerCase())), ...matchingTasks]
    : baseCommands;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filteredCommands[selectedIndex]) filteredCommands[selectedIndex].action(); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="w-full max-w-lg bg-[var(--color-paper-card)] rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--color-line)] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, scale: 0.96, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-line)]">
              <Search size={17} className="text-[var(--color-muted)] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent outline-none text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]"
                placeholder="Type a command or search tasks…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
              />
              <kbd className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--color-paper-deep)] border border-[var(--color-line)] text-[var(--color-muted)]">Esc</kbd>
            </div>

            {/* Command list */}
            <div className="max-h-80 overflow-y-auto" role="menu">
              {filteredCommands.length === 0 ? (
                <div className="px-4 py-8 text-sm text-[var(--color-muted)] text-center">
                  No commands or tasks found matching "{search}"
                </div>
              ) : (
                filteredCommands.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitem"
                      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors ${
                        isSelected
                          ? 'bg-[var(--color-coral-subtle)] text-[var(--color-coral)]'
                          : 'text-[var(--color-ink)] hover:bg-[var(--color-paper-subtle)]'
                      }`}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <span className={`w-7 h-7 flex items-center justify-center rounded-lg shrink-0 ${
                        isSelected ? 'bg-white/40' : 'bg-[var(--color-paper-deep)]'
                      }`}>
                        <Icon size={15} />
                      </span>
                      <span className="flex-1 font-medium">{item.title}</span>
                      {item.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-paper-deep)] text-[var(--color-muted)] font-medium">{item.badge}</span>
                      )}
                      <span className="text-[10px] text-[var(--color-muted)] shrink-0">{item.category}</span>
                      <ArrowRight size={13} className={isSelected ? 'text-[var(--color-coral)]' : 'text-[var(--color-muted)]'} />
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--color-line-subtle)] bg-[var(--color-paper-subtle)]">
              {[['↑', '↓', 'to navigate'], ['↵', 'to select'], ['esc', 'to dismiss']].map(([...keys]) => {
                const desc = keys.pop();
                return (
                  <span key={desc} className="flex items-center gap-1 text-[10px] text-[var(--color-muted)]">
                    {keys.map((k) => (
                      <kbd key={k} className="px-1.5 py-0.5 rounded bg-[var(--color-paper-deep)] border border-[var(--color-line)] font-mono">{k}</kbd>
                    ))}
                    {desc}
                  </span>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
