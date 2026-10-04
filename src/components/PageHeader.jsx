import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PageHeader.scss';

/** Cabeçalho de página. `back` pode ser true (voltar no histórico) ou uma rota. */
export default function PageHeader({ title, subtitle, back, actions }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof back === 'string') navigate(back);
    else if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/');
  };

  return (
    <header className="page-header">
      {back && (
        <button className="page-header__back" onClick={handleBack} aria-label="Voltar">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
      )}
      <div className="page-header__text">
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        <h1>{title}</h1>
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
