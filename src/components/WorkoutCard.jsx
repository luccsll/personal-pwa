import { Link } from 'react-router-dom';
import { ChevronRight, Clock, Dumbbell } from 'lucide-react';
import { joinMuscleGroups } from '@/utils/format';
import { getWorkoutDuration } from '@/utils/workout';
import { muscleGroupColor } from '@/utils/muscleGroups';
import './WorkoutCard.scss';

/** Card compacto de treino. Usa <Link> quando recebe `to` e <button> quando recebe `onClick`. */
export default function WorkoutCard({ workout, label, selected, highlighted, badge, to, onClick }) {
  const content = (
    <>
      <span className="workout-card__accent" style={{ background: muscleGroupColor(workout.muscleGroups[0]) }} />
      <div className="workout-card__body">
        <div className="workout-card__top">
          {label && <span className="workout-card__label">{label}</span>}
          {badge}
        </div>
        <h3 className="workout-card__name">{workout.name}</h3>
        <p className="workout-card__meta">
          <span>{joinMuscleGroups(workout.muscleGroups)}</span>
          <span>
            <Dumbbell size={14} /> {workout.exercises.length}
          </span>
          <span>
            <Clock size={14} /> ~{getWorkoutDuration(workout)} min
          </span>
        </p>
      </div>
      {selected !== undefined ? (
        <span className={`workout-card__radio ${selected ? 'is-selected' : ''}`} aria-hidden />
      ) : (
        <ChevronRight size={20} className="workout-card__chevron" />
      )}
    </>
  );

  const className = `workout-card ${selected || highlighted ? 'workout-card--selected' : ''}`;
  if (to)
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  return (
    <button type="button" className={className} onClick={onClick} aria-pressed={selected}>
      {content}
    </button>
  );
}
