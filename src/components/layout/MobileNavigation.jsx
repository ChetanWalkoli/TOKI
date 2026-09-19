import { CalendarDays, CheckSquare, Home, Settings, Sunrise } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function MobileNavigation({ onAdd }) {
  return (
    <>
      <button
        className="mobile-add"
        onClick={onAdd}
        aria-label="Add new task"
      >
        +
      </button>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? 'active' : '')}
          aria-label="Dashboard"
        >
          <Home size={20} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) => (isActive ? 'active' : '')}
          aria-label="All tasks"
        >
          <CheckSquare size={20} />
          <span>Tasks</span>
        </NavLink>

        <NavLink
          to="/today"
          className={({ isActive }) => (isActive ? 'active' : '')}
          aria-label="Today tasks"
        >
          <CalendarDays size={20} />
          <span>Today</span>
        </NavLink>

        <NavLink
          to="/upcoming"
          className={({ isActive }) => (isActive ? 'active' : '')}
          aria-label="Upcoming tasks"
        >
          <Sunrise size={20} />
          <span>Next</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? 'active' : '')}
          aria-label="Settings"
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </>
  );
}
