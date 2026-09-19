import { Plus, Search, X, Command, Keyboard, Flame, User as UserIcon, LogIn } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';

export default function AppShell({
  children,
  tasks,
  projects = [],
  streak = 0,
  user = null,
  profile = null,
  onAdd,
  query,
  onQueryChange,
  onOpenCommandPalette,
  onOpenShortcuts,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && location.pathname !== '/tasks') {
      navigate('/tasks');
    }
  };

  const handleClearSearch = () => {
    onQueryChange('');
  };

  const displayName = profile?.displayName || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Guest';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-paper)]">
      <Sidebar
        tasks={tasks}
        projects={projects}
        streak={streak}
        user={user}
        profile={profile}
        onOpenCommandPalette={onOpenCommandPalette}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[var(--color-line-subtle)] bg-[var(--color-paper)] shrink-0 z-10">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--color-coral)] text-white font-['Fraunces'] font-bold text-sm">t</span>
            <span className="font-['Fraunces'] font-semibold text-[var(--color-ink)]">Toki</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {streak > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-butter-subtle)] text-[var(--color-butter)] text-xs font-semibold">
                <Flame size={13} />
                <span>{streak}d streak</span>
              </div>
            )}

            {/* Search */}
            <label className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-muted)] text-sm cursor-text min-w-[180px]">
              <Search size={14} className="shrink-0" />
              <input
                type="search"
                aria-label="Search all tasks"
                placeholder="Search tasks…"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="bg-transparent outline-none text-[var(--color-ink)] placeholder:text-[var(--color-muted)] w-full text-sm"
              />
              {query ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="shrink-0 text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
                >
                  <X size={13} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenCommandPalette}
                  title="Command palette (Cmd+K)"
                  className="shrink-0 flex items-center gap-0.5 text-[10px] text-[var(--color-muted)] font-mono"
                >
                  <Command size={11} />K
                </button>
              )}
            </label>

            {/* Shortcuts */}
            <button
              type="button"
              onClick={onOpenShortcuts}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (?)"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-deep)] transition-colors"
            >
              <Keyboard size={17} />
            </button>

            {/* User avatar / sign in */}
            {user ? (
              <Link to="/profile" title={`Signed in as ${displayName}`}
                className="flex items-center justify-center w-8 h-8 rounded-full transition-transform hover:scale-105">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-[var(--color-coral-subtle)] text-[var(--color-coral)] font-bold text-sm flex items-center justify-center border border-[rgba(220,107,84,0.2)]">
                    {initial}
                  </span>
                )}
              </Link>
            ) : (
              <Link to="/login"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-ink)] text-xs font-semibold hover:bg-[var(--color-paper-deep)] transition-colors">
                <LogIn size={13} />
                <span>Sign in</span>
              </Link>
            )}

            {/* Add task */}
            <button
              type="button"
              onClick={onAdd}
              aria-label="Create new task"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-coral)] text-white text-sm font-semibold hover:bg-[var(--color-coral-hover)] transition-colors"
            >
              <Plus size={15} />
              <span>New task</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>

      <MobileNavigation onAdd={onAdd} user={user} />
    </div>
  );
}
