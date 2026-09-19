import {
  CalendarDays,
  CheckSquare,
  Home,
  Settings,
  Sunrise,
  Kanban,
  Calendar,
  Timer,
  BarChart3,
  Flame,
  Search,
  User,
  LogIn,
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { isToday, isOverdue } from '../../utils/task';

export default function Sidebar({ tasks = [], streak = 0, user = null, profile = null, onOpenCommandPalette }) {
  const activeTasks = tasks.filter((t) => !t.completed);
  const todayCount = activeTasks.filter((t) => isToday(t.dueDate) || isOverdue(t)).length;
  const tomorrowOrLaterCount = activeTasks.filter((t) => t.dueDate && !isToday(t.dueDate) && !isOverdue(t)).length;

  const navItems = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare, badge: activeTasks.length > 0 ? activeTasks.length : null },
    { to: '/board', label: 'Board', icon: Kanban },
    { to: '/today', label: 'Today', icon: CalendarDays, badge: todayCount > 0 ? todayCount : null, alert: activeTasks.some(isOverdue) },
    { to: '/upcoming', label: 'Upcoming', icon: Sunrise, badge: tomorrowOrLaterCount > 0 ? tomorrowOrLaterCount : null },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/focus', label: 'Focus', icon: Timer },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const displayName = profile?.displayName || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Guest';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="hidden lg:flex flex-col w-56 xl:w-60 shrink-0 h-full border-r border-[var(--color-line)] bg-[var(--color-paper)] overflow-y-auto">
      {/* Top section */}
      <div className="flex flex-col gap-1 px-3 pt-5 pb-2">
        {/* Brand */}
        <NavLink to="/" aria-label="Toki home"
          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--color-paper-deep)] transition-colors no-underline mb-2">
          <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--color-coral)] text-white font-['Fraunces'] font-bold text-sm shrink-0">t</span>
          <div className="flex flex-col leading-tight">
            <span className="font-['Fraunces'] font-semibold text-sm text-[var(--color-ink)]">Toki</span>
            <span className="text-[10px] text-[var(--color-muted)]">Make progress feel good.</span>
          </div>
        </NavLink>

        {/* Command palette trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          title="Search commands or tasks (Cmd+K / Ctrl+K)"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-muted)] text-xs hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)] transition-all w-full text-left"
        >
          <Search size={13} />
          <span className="flex-1">Quick actions…</span>
          <kbd className="text-[10px] font-mono bg-[var(--color-paper-deep)] px-1.5 py-0.5 rounded text-[var(--color-muted)]">⌘K</kbd>
        </button>

        <p className="text-[10px] font-semibold tracking-wider text-[var(--color-muted)] px-2 pt-3 pb-1 uppercase">Workspace</p>

        {/* Nav items */}
        <nav aria-label="Main navigation" className="flex flex-col gap-0.5">
          {navItems.map(({ to, label, icon: Icon, badge, alert }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
                  isActive
                    ? 'bg-[var(--color-coral-subtle)] text-[var(--color-coral)] font-semibold'
                    : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)] hover:text-[var(--color-ink)]'
                }`
              }
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {badge !== null && (
                <b className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none ${
                  alert
                    ? 'bg-[var(--color-red-subtle)] text-[var(--color-red)]'
                    : 'bg-[var(--color-paper-deep)] text-[var(--color-ink-secondary)]'
                }`}>{badge}</b>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="mt-auto flex flex-col gap-2 px-3 py-4 border-t border-[var(--color-line-subtle)]">
        {streak > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-butter-subtle)] text-[var(--color-butter)] text-xs font-semibold">
            <Flame size={14} />
            <span>{streak} day streak</span>
          </div>
        )}

        {/* User profile card */}
        {user ? (
          <NavLink to="/profile"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[var(--color-line-subtle)] bg-[var(--color-paper-subtle)] hover:bg-[var(--color-paper-card)] hover:border-[var(--color-line)] transition-all no-underline text-[var(--color-ink)]"
            title="Manage Account Profile">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <span className="w-8 h-8 rounded-full bg-[var(--color-coral-subtle)] text-[var(--color-coral)] font-bold text-sm flex items-center justify-center shrink-0 border border-[rgba(220,107,84,0.2)]">
                {initial}
              </span>
            )}
            <div className="flex flex-col overflow-hidden leading-tight">
              <strong className="text-xs font-semibold truncate">{displayName}</strong>
              <small className="text-[11px] text-[var(--color-muted)] truncate">{user.email}</small>
            </div>
          </NavLink>
        ) : (
          <Link to="/login"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-coral-subtle)] border border-[rgba(220,107,84,0.2)] text-[var(--color-coral)] text-xs font-semibold no-underline hover:bg-[#f8dfd8] transition-colors">
            <LogIn size={14} />
            <span>Sign in to sync</span>
          </Link>
        )}

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
              isActive
                ? 'bg-[var(--color-coral-subtle)] text-[var(--color-coral)] font-semibold'
                : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)] hover:text-[var(--color-ink)]'
            }`
          }
        >
          <Settings size={17} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
