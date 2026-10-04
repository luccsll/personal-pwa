import { Link } from 'react-router-dom';
import { CircleCheck, Clock, Dumbbell } from 'lucide-react';
import { formatDate, formatDuration } from '@/utils/date';
import { joinMuscleGroups } from '@/utils/format';
import './WorkoutHistory.scss';

/** Lista de treinos realizados. */
export default function WorkoutHistory({ sessions }) {
  return (
    <ul className="workout-history">
      {sessions.map((session) => (
        <li key={session.id}>
          <Link to={`/historico/${session.id}`} className="workout-history__item">
            <div className="workout-history__date">
              <strong>{new Date(session.startedAt).getDate()}</strong>
              <span>{new Date(session.startedAt).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
            </div>
            <div className="workout-history__body">
              <span className="workout-history__full-date">{formatDate(session.startedAt)}</span>
              <h3>{session.workoutName}</h3>
              <p>
                <span>{joinMuscleGroups(session.muscleGroups)}</span>
              </p>
              <p>
                <span>
                  <Dumbbell size={14} /> {session.exercises.length} exercícios
                </span>
                <span>
                  <Clock size={14} /> {formatDuration(session.duration)}
                </span>
              </p>
            </div>
            <span className="workout-history__status">
              <CircleCheck size={16} /> Concluído
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
