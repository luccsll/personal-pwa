import { Link, NavLink } from 'react-router-dom';
import { ArrowLeftRight, Dumbbell } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import UserAvatar from './UserAvatar';
import { NAV_ITEMS, SIDEBAR_EXTRA_ITEMS } from './navItems';
import './Sidebar.scss';

export default function Sidebar() {
  const { userId, profile } = useAppData();

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
      <Link to="/trocar-usuario" className="sidebar__user" title="Trocar usuário">
        <UserAvatar userId={userId} name={profile.name} />
        <span>
          <strong>{profile.name}</strong>
          <small>Trocar usuário</small>
        </span>
        <ArrowLeftRight size={16} />
      </Link>
    </aside>
  );
}
