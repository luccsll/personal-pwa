import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleCheck, Coffee, Plus, Repeat2 } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import PageHeader from '@/components/PageHeader';
import WorkoutCard from '@/components/WorkoutCard';
import SwitchWorkoutSheet from '@/components/SwitchWorkoutSheet';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { getSelectedWorkout, getWorkoutsForDay, optionLabel } from '@/utils/workout';
import { getWeekProgress } from '@/utils/stats';
import './WorkoutsPage.scss';

export default function WorkoutsPage() {
  const { workouts, sessions, weekSelection, selectWorkoutForDay } = useAppData();
  const [switchDay, setSwitchDay] = useState(null);
  const week = useMemo(() => getWeekProgress(sessions, workouts), [sessions, workouts]);

  const switchOptions = switchDay ? getWorkoutsForDay(workouts, switchDay.index) : [];

  return (
    <>
      <PageHeader title="Meus treinos" subtitle="Sua semana" />

      <div className="workouts-week">
        {week.map((day) => {
          const options = getWorkoutsForDay(workouts, day.index);
          const selected = getSelectedWorkout(workouts, day.index, weekSelection);

          return (
            <section key={day.index} className={`day-card card ${day.isToday ? 'day-card--today' : ''}`}>
              <header className="day-card__header">
                <h2>{day.label.toUpperCase()}</h2>
                {selected?.timeOfDay && <span className="day-card__time">{selected.timeOfDay}</span>}
                {day.isToday && <Badge>Hoje</Badge>}
                {day.done && (
                  <Badge tone="success" icon={CircleCheck}>
                    Feito
                  </Badge>
                )}
                {options.length > 1 && (
                  <Button variant="ghost" className="day-card__switch" icon={Repeat2} onClick={() => setSwitchDay(day)}>
                    Trocar treino
                  </Button>
                )}
              </header>

              {options.length === 0 ? (
                <div className="day-card__rest">
                  <Coffee size={18} />
                  <div>
                    <strong>Dia de descanso</strong>
                    <span>Recuperação também faz parte do treino.</span>
                  </div>
                </div>
              ) : (
                <div className="day-card__options">
                  {options.map((workout, index) => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      to={`/treinos/${workout.id}`}
                      label={options.length > 1 ? `${optionLabel(index)}${workout.id === selected?.id ? ' · Selecionado' : ''}` : null}
                      highlighted={options.length > 1 && workout.id === selected?.id}
                    />
                  ))}
                </div>
              )}

              <Link to={`/treinos/novo?dia=${day.index}`} className="day-card__add">
                <Plus size={16} /> {options.length ? 'Adicionar opção de treino' : 'Adicionar treino'}
              </Link>
            </section>
          );
        })}
      </div>

      <SwitchWorkoutSheet
        open={Boolean(switchDay)}
        dayLabel={switchDay?.label}
        options={switchOptions}
        selectedId={switchDay ? getSelectedWorkout(workouts, switchDay.index, weekSelection)?.id : null}
        onSelect={(id) => selectWorkoutForDay(switchDay.index, id)}
        onClose={() => setSwitchDay(null)}
      />
    </>
  );
}
