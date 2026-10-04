import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, Clock, Dumbbell, Layers, Trash2 } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import PageHeader from '@/components/PageHeader';
import SessionExercises from '@/components/SessionExercises';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import StatCard from '@/components/StatCard';
import { formatDate, formatDuration, formatTime } from '@/utils/date';
import { formatNumber, joinMuscleGroups } from '@/utils/format';

export default function HistoryDetailsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessions, records, deleteSession } = useAppData();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const session = sessions.find((s) => s.id === sessionId && s.completed);
  if (!session) return <Navigate to="/historico" replace />;

  const sets = records.filter((r) => r.sessionId === session.id && r.completed);
  const volume = sets.reduce((t, s) => t + (s.weight ?? 0) * (s.repetitions ?? 0), 0);

  return (
    <>
      <PageHeader
        back="/historico"
        title={session.workoutName}
        subtitle={joinMuscleGroups(session.muscleGroups)}
        actions={<Button variant="ghost" icon={Trash2} aria-label="Excluir treino" onClick={() => setConfirmOpen(true)} />}
      />

      <div className="grid-2">
        <StatCard
          icon={CalendarDays}
          label="Data"
          value={formatDate(session.startedAt)}
          hint={`${formatTime(session.startedAt)} – ${formatTime(session.finishedAt)}`}
        />
        <StatCard icon={Clock} label="Duração" value={formatDuration(session.duration)} />
        <StatCard icon={Dumbbell} label="Exercícios" value={session.exercises.length} />
        <StatCard icon={Layers} label="Volume total" value={`${formatNumber(volume)} kg`} hint={`${sets.length} séries`} />
      </div>

      <section className="section">
        <h2>Exercícios</h2>
        <SessionExercises session={session} />
      </section>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Excluir treino?"
        description="Este treino e todas as séries registradas serão removidos do histórico."
        footer={
          <>
            <Button
              variant="danger"
              block
              icon={Trash2}
              onClick={() => {
                deleteSession(session.id);
                navigate('/historico', { replace: true });
              }}
            >
              Excluir treino
            </Button>
            <Button variant="secondary" block onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
          </>
        }
      />
    </>
  );
}
