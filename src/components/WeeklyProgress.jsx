import { Check } from 'lucide-react';
import './WeeklyProgress.scss';

/** Faixa com os dias da semana: treinado, descanso, hoje. */
export default function WeeklyProgress({ days }) {
  const trainingDays = days.filter((d) => !d.rest).length;
  const done = days.filter((d) => d.done).length;

  return (
    <div className="weekly-progress card">
      <div className="weekly-progress__header">
        <h3>Esta semana</h3>
        <span>
          {done} de {trainingDays} treinos
        </span>
      </div>
      <ol className="weekly-progress__days">
        {days.map((d) => (
          <li
            key={d.key}
            className={[
              'weekly-progress__day',
              d.done && 'is-done',
              d.isToday && 'is-today',
              d.rest && !d.done && 'is-rest',
              d.isPast && !d.done && !d.rest && 'is-missed',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="weekly-progress__label">{d.short}</span>
            <span className="weekly-progress__dot">{d.done ? <Check size={14} strokeWidth={3} /> : d.rest ? '–' : ''}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
