import { CalendarDays, CheckSquare, Home, Settings, Sunrise } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { isToday, isOverdue } from '../../utils/task';

export default function Sidebar({ tasks = [] }) {
  const activeTasks = tasks.filter((t) => !t.completed);
  const todayCount = activeTasks.filter((t) => isToday(t.dueDate) || isOverdue(t)).length;
  const tomorrowOrLaterCount = activeTasks.filter((t) => t.dueDate && !isToday(t.dueDate) && !isOverdue(t)).length;

  const navItems = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare, badge: activeTasks.length > 0 ? activeTasks.length : null },
    { to: '/today', label: 'Today', icon: CalendarDays, badge: todayCount > 0 ? todayCount : null, alert: activeTasks.some(isOverdue) },
    { to: '/upcoming', label: 'Upcoming', icon: Sunrise, badge: tomorrowOrLaterCount > 0 ? tomorrowOrLaterCount : null },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <NavLink to="/" className="brand" aria-label="Toki home">
          <span className="brand-mark">t</span>
          <div className="brand-text">
            <span className="brand-name">Toki</span>
            <span className="brand-tagline">Make progress feel good.</span>
          </div>
        </NavLink>

        <p className="nav-caption">WORKSPACE</p>

        <nav aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon, badge, alert }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {badge !== null && (
                <b className={`nav-badge ${alert ? 'badge-alert' : ''}`}>{badge}</b>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="daily-motto">
          <p className="side-note">"One kind step at a time."</p>
        </div>

        <NavLink
          className={({ isActive }) => `settings-link ${isActive ? 'active' : ''}`}
          to="/settings"
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
