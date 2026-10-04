import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import BottomNavigation from '@/components/BottomNavigation';
import './MainLayout.scss';

export default function MainLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-layout__content">
        <div className="page">
          <Outlet />
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
