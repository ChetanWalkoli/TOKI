import { Plus, Search } from 'lucide-react';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';

export default function AppShell({ children, onAdd, query, onQueryChange }) { return <div className="app-shell"><Sidebar /><main className="main-content"><header className="topbar"><div className="mobile-brand"><span className="brand-mark">t</span> Toki</div><div className="topbar-actions"><label className="header-search"><Search size={17} /><input aria-label="Search tasks" placeholder="Search tasks" value={query} onChange={(event) => onQueryChange(event.target.value)} /></label><button className="avatar" aria-label="Open your profile">C</button><button className="button button-primary top-add" onClick={onAdd}><Plus size={17} /> <span>New task</span></button></div></header>{children}</main><MobileNavigation onAdd={onAdd} /></div>; }
