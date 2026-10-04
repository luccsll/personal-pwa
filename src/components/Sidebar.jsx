import { NavLink } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { NAV_ITEMS, SIDEBAR_EXTRA_ITEMS } from './navItems';
import './Sidebar.scss';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">
          <Dumbbell size={20} strokeWidth={2} />
        </span>
        MyWorkout
      </div>
      <nav className="sidebar__nav" aria-label="Navegação principal">
        {[...NAV_ITEMS, ...SIDEBAR_EXTRA_ITEMS].map(({ label, icon: Icon, route }) => (
          <NavLink key={route} to={route} end={route === '/'} className="sidebar__item">
            <Icon size={20} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
