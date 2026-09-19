import { Plus, Search, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';

export default function AppShell({ children, tasks, onAdd, query, onQueryChange }) {
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

  return (
    <div className="app-shell">
      <Sidebar tasks={tasks} />

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">t</span>
            <span className="brand-title">Toki</span>
          </div>

          <div className="topbar-actions">
            <div className="header-search-wrap">
              <label className="header-search">
                <Search size={16} className="search-icon" />
                <input
                  type="search"
                  aria-label="Search all tasks"
                  placeholder="Search tasks…"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                {query && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={handleClearSearch}
                    aria-label="Clear search query"
                  >
                    <X size={14} />
                  </button>
                )}
              </label>
            </div>

            <button
              className="button button-primary top-add"
              onClick={onAdd}
              aria-label="Create new task"
            >
              <Plus size={16} />
              <span>New task</span>
            </button>
          </div>
        </header>

        <div className="page-container">
          {children}
        </div>
      </main>

      <MobileNavigation onAdd={onAdd} />
    </div>
  );
}
