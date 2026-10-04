import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Clock, Dumbbell, Layers, Pencil, Play } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { useActiveSession, useExerciseMap } from '@/hooks/useDerivedData';
import PageHeader from '@/components/PageHeader';
import ExerciseCard from '@/components/ExerciseCard';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { dayLabel } from '@/utils/date';
import { getLastPerformance } from '@/utils/stats';
import { getWorkoutDuration } from '@/utils/workout';
import { muscleGroupColor } from '@/utils/muscleGroups';
import './WorkoutDetailsPage.scss';

export default function WorkoutDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workouts, sessions, records, startSession, deleteSession } = useAppData();
  const exerciseMap = useExerciseMap();
  const activeSession = useActiveSession();
  const [conflictOpen, setConflictOpen] = useState(false);

  const workout = workouts.find((w) => w.id === id);
  if (!workout) return <Navigate to="/treinos" replace />;

  const totalSets = workout.exercises.reduce((t, ex) => t + ex.sets, 0);
  const isActive = activeSession?.workoutId === workout.id;

  const start = () => {
    const sessionId = startSession(workout.id);
    if (sessionId) navigate(`/treino/${sessionId}`);
  };

  const handleStart = () => {
    if (activeSession && !isActive) setConflictOpen(true);
    else start();
  };

  return (
    <>
      <PageHeader
        back
        title={workout.name}
        subtitle={`${dayLabel(workout.dayOfWeek)} · ${workout.type === 'primary' ? 'Principal' : 'Alternativo'}`}
        actions={<Button variant="secondary" icon={Pencil} aria-label="Editar treino" onClick={() => navigate(`/treinos/${workout.id}/editar`)} />}
      />

      <div className="workout-details__groups">
        {workout.muscleGroups.map((g) => (
          <Badge key={g} color={muscleGroupColor(g)}>
            {g}
          </Badge>
        ))}
      </div>

      <div className="grid-3 workout-details__stats">
        <div className="workout-details__stat">
          <Dumbbell size={18} />
          <strong>{workout.exercises.length}</strong>
          <span>exercícios</span>
        </div>
        <div className="workout-details__stat">
          <Layers size={18} />
          <strong>{totalSets}</strong>
          <span>séries</span>
        </div>
        <div className="workout-details__stat">
          <Clock size={18} />
          <strong>~{getWorkoutDuration(workout)}</strong>
          <span>minutos</span>
        </div>
      </div>

      <section className="section">
        <h2>Exercícios</h2>
        <div className="workout-details__list">
          {workout.exercises.map((item, index) => (
            <ExerciseCard
              key={item.id}
              index={index}
              item={item}
              exercise={exerciseMap.get(item.exerciseId)}
              lastPerformance={getLastPerformance(item.exerciseId, sessions, records)}
              to={`/exercicios/${item.exerciseId}`}
            />
          ))}
        </div>
      </section>

      <div className="workout-details__cta">
        <Button size="lg" block icon={Play} onClick={handleStart} disabled={!workout.exercises.length}>
          {isActive ? 'Continuar treino' : 'Iniciar treino'}
        </Button>
      </div>

      <Modal
        open={conflictOpen}
        onClose={() => setConflictOpen(false)}
        title="Treino em andamento"
        description={`Você ainda não finalizou "${activeSession?.workoutName}". O que deseja fazer?`}
        footer={
          <>
            <Button block onClick={() => navigate(`/treino/${activeSession.id}`)}>
              Continuar treino em andamento
            </Button>
            <Button
              variant="danger"
              block
              onClick={() => {
                deleteSession(activeSession.id);
                setConflictOpen(false);
                start();
              }}
            >
              Descartar e iniciar este treino
            </Button>
          </>
        }
      />
    </>
  );
}
