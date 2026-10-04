import { CircleCheck } from 'lucide-react';
import ExerciseImage from './ExerciseImage';
import { useAppData } from '@/hooks/useAppData';
import { useExerciseMap } from '@/hooks/useDerivedData';
import { formatWeight } from '@/utils/format';
import { getSessionSets } from '@/utils/stats';
import './SessionExercises.scss';

/** Exercícios de um treino realizado com as cargas e repetições de cada série. */
export default function SessionExercises({ session }) {
  const { records } = useAppData();
  const exerciseMap = useExerciseMap();

  return (
    <div className="session-exercises">
      {session.exercises.map((item) => {
        const exercise = exerciseMap.get(item.exerciseId);
        const sets = getSessionSets(session.id, records, item.id).filter((s) => s.completed);
        return (
          <article key={item.id} className="session-exercises__item card">
            <header>
              <ExerciseImage exercise={exercise} className="session-exercises__image" />
              <div>
                <h3>{exercise?.name ?? 'Exercício removido'}</h3>
                <span className="secondary-text">
                  {sets.length} de {item.sets} séries
                </span>
              </div>
              {sets.length >= item.sets && <CircleCheck size={20} className="session-exercises__check" />}
            </header>
            {sets.length > 0 ? (
              <ol className="session-exercises__sets">
                {sets.map((s) => (
                  <li key={s.id}>
                    <span>Série {s.setNumber}</span>
                    <strong>
                      {formatWeight(s.weight)} × {s.repetitions ?? '—'} reps
                    </strong>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted session-exercises__empty">Não realizado</p>
            )}
          </article>
        );
      })}
    </div>
  );
}
