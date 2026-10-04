import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';
import './BottomNavigation.scss';

export default function BottomNavigation() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {NAV_ITEMS.map(({ label, icon: Icon, route }) => (
        <NavLink key={route} to={route} end={route === '/'} className="bottom-nav__item">
          <Icon size={22} strokeWidth={1.8} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
