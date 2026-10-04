import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { useExerciseMap } from '@/hooks/useDerivedData';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import ExerciseImage from '@/components/ExerciseImage';
import { MUSCLE_GROUPS } from '@/data/initialData';
import { WEEK_DAYS } from '@/utils/date';
import './WorkoutEditorPage.scss';

const normalize = (t) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

function NumberField({ label, value, onChange, min = 1, max = 99 }) {
  return (
    <label className="editor__number">
      <span>{label}</span>
      <input
        className="input"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/\D/g, ''));
          onChange(Math.min(max, Math.max(min, n || min)));
        }}
      />
    </label>
  );
}

/** Criação e edição de treinos (exercícios, séries, repetições e ordem). */
export default function WorkoutEditorPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { workouts, exercises, saveWorkout, deleteWorkout, addExercise } = useAppData();
  const exerciseMap = useExerciseMap();

  const existing = id ? workouts.find((w) => w.id === id) : null;
  const initialDay = Number(params.get('dia') ?? new Date().getDay());

  const [form, setForm] = useState(() =>
    existing
      ? structuredClone(existing)
      : {
          name: '',
          dayOfWeek: initialDay,
          muscleGroups: [],
          type: workouts.some((w) => w.dayOfWeek === initialDay) ? 'alternative' : 'primary',
          exercises: [],
        },
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [newGroup, setNewGroup] = useState(MUSCLE_GROUPS[0]);

  const filtered = useMemo(
    () => exercises.filter((e) => normalize(`${e.name} ${e.muscleGroup}`).includes(normalize(query))),
    [exercises, query],
  );

  if (id && !existing) return <Navigate to="/treinos" replace />;

  const patch = (changes) => setForm((f) => ({ ...f, ...changes }));
  const patchItem = (index, changes) =>
    patch({ exercises: form.exercises.map((ex, i) => (i === index ? { ...ex, ...changes } : ex)) });
  const move = (index, delta) => {
    const list = [...form.exercises];
    const [item] = list.splice(index, 1);
    list.splice(index + delta, 0, item);
    patch({ exercises: list });
  };

  const toggleGroup = (group) =>
    patch({
      muscleGroups: form.muscleGroups.includes(group)
        ? form.muscleGroups.filter((g) => g !== group)
        : [...form.muscleGroups, group],
    });

  const addItem = (exercise) => {
    patch({
      exercises: [
        ...form.exercises,
        { exerciseId: exercise.id, sets: exercise.sets ?? 3, repetitions: exercise.repetitions ?? 10, restTime: exercise.restTime ?? 90 },
      ],
      muscleGroups:
        exercise.muscleGroup && !form.muscleGroups.includes(exercise.muscleGroup)
          ? [...form.muscleGroups, exercise.muscleGroup]
          : form.muscleGroups,
    });
    setPickerOpen(false);
    setQuery('');
  };

  const createAndAdd = () => {
    if (!query.trim()) return;
    addItem(addExercise({ name: query, muscleGroup: newGroup }));
  };

  const name = form.name.trim() || form.muscleGroups.join(' + ');
  const canSave = name && form.exercises.length > 0;

  const handleSave = () => {
    const saved = saveWorkout({ ...form, name });
    navigate(`/treinos/${saved.id}`, { replace: true });
  };

  return (
    <div className="editor">
      <PageHeader back title={existing ? 'Editar treino' : 'Novo treino'} />

      <div className="card stack">
        <label className="field">
          <span>Nome do treino</span>
          <input
            className="input"
            value={form.name}
            placeholder={form.muscleGroups.join(' + ') || 'Ex.: Peito + Tríceps'}
            onChange={(e) => patch({ name: e.target.value })}
          />
        </label>
        <div className="grid-2">
          <label className="field">
            <span>Dia da semana</span>
            <select className="input" value={form.dayOfWeek} onChange={(e) => patch({ dayOfWeek: Number(e.target.value) })}>
              {WEEK_DAYS.map((d) => (
                <option key={d.index} value={d.index}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Tipo</span>
            <select className="input" value={form.type} onChange={(e) => patch({ type: e.target.value })}>
              <option value="primary">Principal</option>
              <option value="alternative">Alternativo</option>
            </select>
          </label>
        </div>
        <div className="field">
          <span>Grupos musculares</span>
          <div className="editor__chips">
            {MUSCLE_GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                className={`editor__chip ${form.muscleGroups.includes(g) ? 'is-selected' : ''}`}
                aria-pressed={form.muscleGroups.includes(g)}
                onClick={() => toggleGroup(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="section">
        <div className="section__header">
          <h2>Exercícios</h2>
          <span className="secondary-text">{form.exercises.length}</span>
        </div>

        {form.exercises.map((item, index) => {
          const exercise = exerciseMap.get(item.exerciseId);
          return (
            <div key={item.id ?? `${item.exerciseId}-${index}`} className="card editor__item">
              <div className="editor__item-header">
                <ExerciseImage exercise={exercise} className="editor__item-image" />
                <div>
                  <span className="editor__order">{index + 1}</span>
                  <h3>{exercise?.name ?? 'Exercício'}</h3>
                </div>
                <div className="editor__item-actions">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Mover para cima">
                    <ArrowUp size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === form.exercises.length - 1}
                    aria-label="Mover para baixo"
                  >
                    <ArrowDown size={18} />
                  </button>
                  <button
                    type="button"
                    className="is-danger"
                    onClick={() => patch({ exercises: form.exercises.filter((_, i) => i !== index) })}
                    aria-label="Remover exercício"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="grid-3">
                <NumberField label="Séries" value={item.sets} max={10} onChange={(v) => patchItem(index, { sets: v })} />
                <NumberField label="Repetições" value={item.repetitions} max={100} onChange={(v) => patchItem(index, { repetitions: v })} />
                <NumberField label="Descanso (s)" value={item.restTime ?? 90} min={0} max={600} onChange={(v) => patchItem(index, { restTime: v })} />
              </div>
            </div>
          );
        })}

        <Button variant="secondary" block icon={Plus} onClick={() => setPickerOpen(true)}>
          Adicionar exercício
        </Button>
      </section>

      <div className="editor__footer">
        <Button size="lg" block icon={Save} disabled={!canSave} onClick={handleSave}>
          Salvar treino
        </Button>
        {existing && (
          <Button variant="ghost" block icon={Trash2} className="editor__delete" onClick={() => setDeleteOpen(true)}>
            Excluir treino
          </Button>
        )}
      </div>

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Adicionar exercício">
        <label className="editor__search">
          <Search size={18} />
          <input className="input" type="search" placeholder="Buscar ou criar exercício" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="editor__picker-list">
          {filtered.map((e) => (
            <button key={e.id} type="button" className="editor__picker-item" onClick={() => addItem(e)}>
              <ExerciseImage exercise={e} className="editor__item-image" />
              <div>
                <strong>{e.name}</strong>
                <span>{e.muscleGroup}</span>
              </div>
              <Plus size={18} />
            </button>
          ))}
        </div>
        {query.trim() && (
          <div className="editor__create">
            <p>
              Criar <strong>“{query.trim()}”</strong>
            </p>
            <div className="editor__create-row">
              <select className="input" value={newGroup} onChange={(e) => setNewGroup(e.target.value)} aria-label="Grupo muscular">
                {MUSCLE_GROUPS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              <Button icon={Plus} onClick={createAndAdd}>
                Criar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Excluir treino?"
        description="O treino será removido da semana. Os treinos já realizados continuam no histórico."
        footer={
          <>
            <Button
              variant="danger"
              block
              icon={Trash2}
              onClick={() => {
                deleteWorkout(existing.id);
                navigate('/treinos', { replace: true });
              }}
            >
              Excluir
            </Button>
            <Button variant="secondary" block onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
          </>
        }
      />
    </div>
  );
}
