import { formatDate } from '@/utils/date';
import { formatSigned, formatWeight } from '@/utils/format';
import './ExerciseHistory.scss';

/** Lista "data — carga" de um exercício, do mais recente para o mais antigo. */
export default function ExerciseHistory({ history, limit }) {
  const rows = [...history].reverse().slice(0, limit ?? history.length);

  return (
    <ul className="exercise-history">
      {rows.map((entry) => {
        const index = history.indexOf(entry);
        const previous = history[index - 1];
        const diff = previous ? entry.maxWeight - previous.maxWeight : null;
        return (
          <li key={entry.sessionId}>
            <span className="exercise-history__date">{formatDate(entry.date)}</span>
            <span className="exercise-history__sets">
              {entry.sets
                .map((s) => `${formatWeight(s.weight).replace(' kg', '')}×${s.repetitions ?? '—'}${s.rir !== null && s.rir !== undefined ? ` @${s.rir}` : ''}`)
                .join('  ')}
            </span>
            <strong className="exercise-history__weight">{formatWeight(entry.maxWeight)}</strong>
            {diff !== null && diff !== 0 && (
              <span className={`exercise-history__diff ${diff > 0 ? 'is-up' : 'is-down'}`}>{formatSigned(diff)}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
