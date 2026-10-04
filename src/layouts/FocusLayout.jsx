import { Outlet } from 'react-router-dom';
import './FocusLayout.scss';

/** Layout sem navegação, usado durante a execução do treino. */
export default function FocusLayout() {
  return (
    <div className="focus-layout">
      <Outlet />
    </div>
  );
}
