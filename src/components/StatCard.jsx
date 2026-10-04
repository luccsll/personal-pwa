import { Link } from 'react-router-dom';
import './StatCard.scss';

export default function StatCard({ icon: Icon, label, value, hint, to }) {
  const content = (
    <>
      {Icon && (
        <span className="stat-card__icon">
          <Icon size={18} strokeWidth={1.8} />
        </span>
      )}
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__value">{value}</strong>
      {hint && <span className="stat-card__hint">{hint}</span>}
    </>
  );

  return to ? (
    <Link to={to} className="stat-card stat-card--link">
      {content}
    </Link>
  ) : (
    <div className="stat-card">{content}</div>
  );
}
