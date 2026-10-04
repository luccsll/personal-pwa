import { Link } from 'react-router-dom';
import { ChevronRight, History, Timer } from 'lucide-react';
import ExerciseImage from './ExerciseImage';
import { formatReps, formatRest, formatSetValue, repsUnit } from '@/utils/workout';
import './ExerciseCard.scss';

/** Exercício dentro de um treino: imagem, séries × repetições e a última carga usada. */
export default function ExerciseCard({ exercise, item, index, lastPerformance, to }) {
  const content = (
    <>
      <ExerciseImage exercise={exercise} className="exercise-card__image" />
      <div className="exercise-card__body">
        <span className="exercise-card__index">{index + 1}</span>
        <h3>{exercise?.name ?? 'Exercício removido'}</h3>
        <p className="exercise-card__plan">
          {item.sets} séries × {formatReps(item)} {repsUnit(exercise)}
          <span className="exercise-card__rest">
            <Timer size={12} /> {formatRest(item.restTime)}
          </span>
        </p>
        <p className="exercise-card__last">
          <History size={13} />
          {lastPerformance ? (
            <>
              Último treino: <strong>{formatSetValue(lastPerformance.lastSet, exercise)}</strong>
            </>
          ) : (
            'Ainda sem registros'
          )}
        </p>
      </div>
      {to && <ChevronRight size={20} className="exercise-card__chevron" />}
    </>
  );

  return to ? (
    <Link to={to} className="exercise-card exercise-card--link">
      {content}
    </Link>
  ) : (
    <div className="exercise-card">{content}</div>
  );
}
