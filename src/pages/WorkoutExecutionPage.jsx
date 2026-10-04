import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Flag,
  History,
  LayoutList,
  Plus,
  SquareStack,
  Timer,
  X,
} from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { useExerciseMap } from '@/hooks/useDerivedData';
import ExerciseImage from '@/components/ExerciseImage';
import ProgressBar from '@/components/ProgressBar';
import SetInput from '@/components/SetInput';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import WorkoutSummary from '@/components/WorkoutSummary';
import { formatWeight } from '@/utils/format';
import { getLastPerformance } from '@/utils/stats';
import './WorkoutExecutionPage.scss';

function ElapsedTime({ since }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const total = Math.max(0, Math.floor((now - new Date(since)) / 1000));
  const h = Math.floor(total / 3600);
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return <span className="execution__timer">{h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`}</span>;
}

const vibrate = () => {
  try {
    navigator.vibrate?.(40);
  } catch {
    /* sem suporte */
  }
};

export default function WorkoutExecutionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessions, records, updateSet, setSessionIndex, addSessionSet, finishSession, deleteSession } = useAppData();
  const exerciseMap = useExerciseMap();
  const [view, setView] = useState('single');
  const [finishOpen, setFinishOpen] = useState(false);

  const session = sessions.find((s) => s.id === sessionId);

  // Séries registradas nesta sessão, indexadas por item do treino
  const setsByItem = useMemo(() => {
    const map = new Map();
    for (const r of records) {
      if (r.sessionId !== sessionId) continue;
      if (!map.has(r.itemId)) map.set(r.itemId, new Map());
      map.get(r.itemId).set(r.setNumber, r);
    }
    return map;
  }, [records, sessionId]);

  // Última execução de cada exercício (antes deste treino)
  const lastByExercise = useMemo(() => {
    const map = new Map();
    session?.exercises.forEach((item) => {
      if (!map.has(item.exerciseId)) {
        map.set(item.exerciseId, getLastPerformance(item.exerciseId, sessions, records, sessionId));
      }
    });
    return map;
    // Só recalcula quando muda a sessão: o histórico anterior não muda durante o treino
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, session?.exercises.length]);

  if (!session) return <Navigate to="/" replace />;
  if (session.completed) return <WorkoutSummary session={session} />;

  const items = session.exercises;
  const index = Math.min(session.currentIndex ?? 0, items.length - 1);
  const item = items[index];
  const exercise = exerciseMap.get(item.exerciseId);
  const last = lastByExercise.get(item.exerciseId);

  const completedCount = (it) => [...(setsByItem.get(it.id)?.values() ?? [])].filter((r) => r.completed).length;
  const isItemDone = (it) => completedCount(it) >= it.sets;
  const doneExercises = items.filter(isItemDone).length;
  const totalSetsDone = items.reduce((t, it) => t + completedCount(it), 0);
  const itemDone = isItemDone(item);
  const isLast = index === items.length - 1;

  /** Valores exibidos em uma série: registro salvo ou sugestão (série anterior / último treino). */
  const getSetValues = (setNumber) => {
    const sets = setsByItem.get(item.id);
    const saved = sets?.get(setNumber);
    const previous = sets?.get(setNumber - 1);
    const lastSet = last?.sets.find((s) => s.setNumber === setNumber) ?? last?.lastSet;
    return {
      weight: saved?.weight ?? previous?.weight ?? lastSet?.weight ?? null,
      repetitions: saved?.repetitions ?? previous?.repetitions ?? lastSet?.repetitions ?? item.repetitions,
      completed: Boolean(saved?.completed),
    };
  };

  const firstOpenSet = Array.from({ length: item.sets }, (_, i) => i + 1).find((n) => !getSetValues(n).completed);

  const goTo = (i) => {
    setSessionIndex(session.id, i);
    setView('single');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (setNumber, patch) => {
    const { weight, repetitions } = getSetValues(setNumber);
    updateSet(session.id, item, setNumber, { weight, repetitions, ...patch });
  };

  const handleToggle = (setNumber) => {
    const values = getSetValues(setNumber);
    if (values.completed) {
      updateSet(session.id, item, setNumber, { completed: false });
    } else {
      vibrate();
      updateSet(session.id, item, setNumber, {
        weight: values.weight,
        repetitions: values.repetitions,
        completed: true,
        completedAt: new Date().toISOString(),
      });
    }
  };

  const handleFinish = () => {
    finishSession(session.id);
    setFinishOpen(false);
    window.scrollTo(0, 0);
  };

  const handleDiscard = () => {
    deleteSession(session.id);
    navigate('/', { replace: true });
  };

  return (
    <div className="execution">
      <header className="execution__topbar">
        <Link to="/" className="execution__icon-btn" aria-label="Sair (o progresso fica salvo)">
          <X size={22} />
        </Link>
        <div className="execution__title">
          <strong>{session.workoutName}</strong>
          <span>
            <Timer size={13} /> <ElapsedTime since={session.startedAt} />
          </span>
        </div>
        <button
          className="execution__icon-btn"
          onClick={() => setView(view === 'single' ? 'list' : 'single')}
          aria-label={view === 'single' ? 'Ver todos os exercícios' : 'Ver exercício atual'}
        >
          {view === 'single' ? <LayoutList size={22} /> : <SquareStack size={22} />}
        </button>
      </header>

      <div className="execution__progress">
        <div className="execution__progress-text">
          <span>
            <strong>
              {doneExercises} / {items.length}
            </strong>{' '}
            exercícios concluídos
          </span>
          <span className="muted">{totalSetsDone} séries</span>
        </div>
        <ProgressBar value={doneExercises} max={items.length} />
      </div>

      {view === 'list' ? (
        <div className="execution__list">
          {items.map((it, i) => {
            const ex = exerciseMap.get(it.exerciseId);
            const done = isItemDone(it);
            return (
              <button
                key={it.id}
                className={`execution__list-item ${i === index ? 'is-current' : ''} ${done ? 'is-done' : ''}`}
                onClick={() => goTo(i)}
              >
                <ExerciseImage exercise={ex} className="execution__list-image" />
                <div>
                  <strong>{ex?.name ?? 'Exercício'}</strong>
                  <span>
                    {completedCount(it)} / {it.sets} séries · {it.repetitions} reps
                  </span>
                </div>
                {done ? <CircleCheck size={22} className="execution__list-check" /> : <ChevronRight size={20} />}
              </button>
            );
          })}
          <Button variant="success" size="lg" block icon={Flag} onClick={() => setFinishOpen(true)}>
            Finalizar treino
          </Button>
        </div>
      ) : (
        <div className="execution__exercise" key={item.id}>
          <div className="execution__hero">
            <ExerciseImage exercise={exercise} className="execution__image" />
            <div className="execution__heading">
              <span className="execution__counter">
                Exercício {index + 1} de {items.length}
              </span>
              <h1>{exercise?.name ?? 'Exercício'}</h1>
              <p className="execution__group">{exercise?.muscleGroup}</p>
              <p className="execution__plan">
                {item.sets} séries × {item.repetitions} repetições
              </p>
              {exercise?.instructions && <p className="execution__instructions">{exercise.instructions}</p>}
            </div>
          </div>

          <div className="execution__last">
            <History size={18} />
            <div>
              <span>Último treino</span>
              {last ? (
                <strong>{last.sets.map((s) => `${formatWeight(s.weight)} × ${s.repetitions ?? '—'}`).join('   ·   ')}</strong>
              ) : (
                <strong>Primeira vez — escolha uma carga confortável</strong>
              )}
            </div>
          </div>

          {itemDone && (
            <div className="execution__done-banner">
              <CircleCheck size={20} /> Exercício concluído!
            </div>
          )}

          <div className="execution__sets">
            {Array.from({ length: item.sets }, (_, i) => i + 1).map((setNumber) => {
              const values = getSetValues(setNumber);
              return (
                <SetInput
                  key={setNumber}
                  setNumber={setNumber}
                  weight={values.weight}
                  repetitions={values.repetitions}
                  completed={values.completed}
                  active={setNumber === firstOpenSet}
                  onChange={(patch) => handleChange(setNumber, patch)}
                  onToggle={() => handleToggle(setNumber)}
                />
              );
            })}
            <button className="execution__add-set" onClick={() => addSessionSet(session.id, item.id)}>
              <Plus size={16} /> Adicionar série
            </button>
          </div>
        </div>
      )}

      {view === 'single' && (
        <nav className="execution__bottom">
          <Button variant="secondary" size="lg" icon={ChevronLeft} disabled={index === 0} onClick={() => goTo(index - 1)} aria-label="Exercício anterior">
            <span className="execution__bottom-label">Anterior</span>
          </Button>
          {isLast ? (
            <Button variant="success" size="lg" block icon={Flag} onClick={() => setFinishOpen(true)}>
              Finalizar treino
            </Button>
          ) : (
            <Button variant={itemDone ? 'success' : 'primary'} size="lg" block iconRight={ChevronRight} onClick={() => goTo(index + 1)}>
              Próximo exercício
            </Button>
          )}
        </nav>
      )}

      <Modal
        open={finishOpen}
        onClose={() => setFinishOpen(false)}
        title="Finalizar treino?"
        description={
          doneExercises === items.length
            ? 'Todos os exercícios foram concluídos. Mandou bem!'
            : `Você concluiu ${doneExercises} de ${items.length} exercícios. Séries não concluídas não serão salvas no histórico.`
        }
        footer={
          <>
            <Button variant="success" size="lg" block icon={Flag} onClick={handleFinish} disabled={totalSetsDone === 0}>
              Finalizar treino
            </Button>
            <Button variant="secondary" block onClick={() => setFinishOpen(false)}>
              Continuar treinando
            </Button>
            <Button variant="ghost" block className="execution__discard" onClick={handleDiscard}>
              Descartar treino
            </Button>
          </>
        }
      >
        {totalSetsDone === 0 && <p className="muted">Conclua pelo menos uma série para salvar o treino.</p>}
      </Modal>
    </div>
  );
}
