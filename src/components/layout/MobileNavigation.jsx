import { useState } from 'react';
import {
  CalendarDays,
  CheckSquare,
  Home,
  Kanban,
  Timer,
  MoreHorizontal,
  Calendar,
  BarChart3,
  Settings,
  X,
  User,
  LogIn,
  FolderGit2,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function MobileNavigation({ onAdd, user = null }) {
  const [moreOpen, setMoreOpen] = useState(false);

  const linkCls = ({ isActive }) =>
    `flex flex-col items-center gap-0.5 text-[10px] font-medium no-underline transition-colors ${
      isActive ? 'text-[var(--color-coral)]' : 'text-[var(--color-muted)]'
    }`;

  return (
    <>
      {/* Floating Add button */}
      <button
        className="lg:hidden fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-[var(--color-coral)] text-white text-2xl font-bold flex items-center justify-center shadow-[var(--shadow-lg)] hover:bg-[var(--color-coral-hover)] transition-colors"
        onClick={onAdd}
        aria-label="Add new task"
      >
        +
      </button>

      {/* Bottom Sheet for extra pages */}
      {moreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 bg-[var(--color-paper-card)] border-t border-[var(--color-line)] rounded-t-2xl p-4 max-h-80 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-['Fraunces'] font-semibold text-[var(--color-ink)] text-base">More Views</h3>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close menu"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-paper-deep)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/projects', Icon: FolderGit2, label: 'Projects' },
                { to: '/calendar', Icon: Calendar, label: 'Calendar' },
                { to: '/upcoming', Icon: CalendarDays, label: 'Upcoming' },
                { to: '/analytics', Icon: BarChart3, label: 'Analytics' },
                { to: '/settings', Icon: Settings, label: 'Settings' },
                user
                  ? { to: '/profile', Icon: User, label: 'Profile' }
                  : { to: '/login', Icon: LogIn, label: 'Sign in' },
              ].map(({ to, Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-paper-subtle)] border border-[var(--color-line-subtle)] text-[var(--color-ink-secondary)] text-sm font-medium no-underline hover:bg-[var(--color-paper-deep)] transition-colors"
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--color-paper-card)] border-t border-[var(--color-line)] flex items-center justify-around px-2 py-2"
        aria-label="Mobile navigation"
      >
        <NavLink to="/" className={linkCls} aria-label="Dashboard">
          <Home size={20} />
          <span>Home</span>
        </NavLink>

        <NavLink to="/tasks" className={linkCls} aria-label="Tasks">
          <CheckSquare size={20} />
          <span>Tasks</span>
        </NavLink>

        <NavLink to="/board" className={linkCls} aria-label="Kanban Board">
          <Kanban size={20} />
          <span>Board</span>
        </NavLink>

        <NavLink to="/today" className={linkCls} aria-label="Today">
          <CalendarDays size={20} />
          <span>Today</span>
        </NavLink>

        <NavLink to="/focus" className={linkCls} aria-label="Focus Pomodoro">
          <Timer size={20} />
          <span>Focus</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setMoreOpen((prev) => !prev)}
          aria-label="More navigation"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            moreOpen ? 'text-[var(--color-coral)]' : 'text-[var(--color-muted)]'
          }`}
        >
          <MoreHorizontal size={20} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
