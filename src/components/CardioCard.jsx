import { Check, HeartPulse } from 'lucide-react';
import './CardioCard.scss';

/**
 * Cardio do treino (Lucas: 10 min, Anthony: 20 min — definido em "Meus dados").
 * Com `onToggle`, vira um botão para marcar o cardio como feito.
 */
export default function CardioCard({ minutes, done = false, onToggle }) {
  if (!minutes) return null;
  const content = (
    <>
      <span className="cardio-card__icon">
        <HeartPulse size={22} strokeWidth={1.8} />
      </span>
      <div className="cardio-card__body">
        <strong>Cardio</strong>
        <span>{minutes} minutos</span>
      </div>
      {onToggle && (
        <span className="cardio-card__check" aria-hidden>
          {done ? (
            <>
              <Check size={16} strokeWidth={3} /> Feito
            </>
          ) : (
            'Marcar como feito'
          )}
        </span>
      )}
    </>
  );

  return onToggle ? (
    <button type="button" className={`cardio-card ${done ? 'is-done' : ''}`} onClick={onToggle} aria-pressed={done}>
      {content}
    </button>
  ) : (
    <div className="cardio-card">{content}</div>
  );
}
