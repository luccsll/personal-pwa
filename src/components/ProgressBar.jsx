import './ProgressBar.scss';

export default function ProgressBar({ value, max, label }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="progress-bar">
      {label && (
        <div className="progress-bar__label">
          <span>{label}</span>
          <strong>{percent}%</strong>
        </div>
      )}
      <div className="progress-bar__track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
