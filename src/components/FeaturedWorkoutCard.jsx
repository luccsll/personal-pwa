import { Clock, Dumbbell, Play, Repeat2, CircleCheck, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';
import Badge from './Badge';
import { joinMuscleGroups } from '@/utils/format';
import { getWorkoutDuration } from '@/utils/workout';
import './FeaturedWorkoutCard.scss';

const STATUS = {
  pending: { label: 'Pendente', icon: Clock },
  active: { label: 'Em andamento', icon: Play },
  done: { label: 'Concluído', icon: CircleCheck },
};

/** Card de destaque do treino do dia no início. */
export default function FeaturedWorkoutCard({ workout, status = 'pending', onStart, onSwitch, canSwitch, nextWorkout }) {
  if (!workout) {
    return (
      <section className="featured-card featured-card--rest">
        <span className="featured-card__eyebrow">Treino de hoje</span>
        <div className="featured-card__rest-icon">
          <Coffee size={28} strokeWidth={1.8} />
        </div>
        <h2 className="featured-card__title">Dia de descanso</h2>
        <p className="featured-card__subtitle">Recupere as energias. O descanso também faz parte do treino.</p>
        {nextWorkout && (
          <p className="featured-card__next">
            Próximo: <strong>{nextWorkout.dayLabel}</strong> — {nextWorkout.workout.name}
          </p>
        )}
      </section>
    );
  }

  const { label, icon } = STATUS[status];
  const actionLabel = status === 'active' ? 'Continuar treino' : status === 'done' ? 'Treinar novamente' : 'Iniciar treino';

  return (
    <section className="featured-card">
      <div className="featured-card__top">
        <span className="featured-card__eyebrow">Treino de hoje</span>
        <Badge tone="inverse" icon={icon}>
          {label}
        </Badge>
      </div>

      <Link to={`/treinos/${workout.id}`} className="featured-card__title-link">
        <h2 className="featured-card__title">{workout.name}</h2>
        <p className="featured-card__subtitle">{joinMuscleGroups(workout.muscleGroups)}</p>
      </Link>

      <div className="featured-card__meta">
        <span>
          <Dumbbell size={16} /> {workout.exercises.length} exercícios
        </span>
        <span>
          <Clock size={16} /> ~{getWorkoutDuration(workout)} minutos
        </span>
      </div>

      <div className="featured-card__actions">
        <Button variant="light" size="lg" block icon={Play} onClick={onStart}>
          {actionLabel}
        </Button>
        {canSwitch && status === 'pending' && (
          <Button variant="ghost" className="featured-card__switch" icon={Repeat2} onClick={onSwitch}>
            Trocar treino
          </Button>
        )}
      </div>
    </section>
  );
}
