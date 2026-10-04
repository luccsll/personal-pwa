import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompletedSessions } from '@/hooks/useDerivedData';
import PageHeader from '@/components/PageHeader';
import WorkoutHistory from '@/components/WorkoutHistory';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import './HistoryPage.scss';

export default function HistoryPage() {
  const sessions = useCompletedSessions();

  // Agrupa por mês: "outubro de 2026"
  const groups = useMemo(() => {
    const map = new Map();
    for (const s of sessions) {
      const label = new Date(s.startedAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(s);
    }
    return [...map.entries()];
  }, [sessions]);

  return (
    <>
      <PageHeader title="Histórico" subtitle={sessions.length ? `${sessions.length} treinos realizados` : undefined} />

      {sessions.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhum treino ainda"
          description="Os treinos finalizados aparecem aqui com todas as cargas e repetições."
          action={
            <Button as={Link} to="/">
              Ver treino de hoje
            </Button>
          }
        />
      ) : (
        groups.map(([label, list]) => (
          <section key={label} className="section history-page">
            <h2 className="history__month">{label}</h2>
            <WorkoutHistory sessions={list} />
          </section>
        ))
      )}
    </>
  );
}
