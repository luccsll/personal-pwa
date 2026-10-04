import { getWeekStart } from './date';

export const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Treinos configurados para um dia, com o principal primeiro. */
export function getWorkoutsForDay(workouts, dayOfWeek) {
  return workouts
    .filter((w) => w.dayOfWeek === dayOfWeek)
    .sort((a, b) => (a.type === b.type ? 0 : a.type === 'primary' ? -1 : 1));
}

export const optionLabel = (index) => `Treino ${OPTION_LETTERS[index] ?? index + 1}`;

/** Treino escolhido para o dia na semana atual (o principal, se nenhum foi trocado). */
export function getSelectedWorkout(workouts, dayOfWeek, weekSelection, now = new Date()) {
  const options = getWorkoutsForDay(workouts, dayOfWeek);
  if (!options.length) return null;
  const isCurrentWeek = weekSelection?.weekStart === getWeekStart(now);
  const chosenId = isCurrentWeek ? weekSelection.choices?.[dayOfWeek] : null;
  return options.find((w) => w.id === chosenId) ?? options[0];
}

/** Estimativa de duração em minutos: ~40s por série + descanso, arredondado de 5 em 5. */
export function estimateDuration(exercises = []) {
  const seconds = exercises.reduce((total, ex) => total + ex.sets * (40 + (ex.restTime ?? 90)), 0);
  return Math.max(5, Math.round(seconds / 60 / 5) * 5);
}

export const getWorkoutDuration = (workout) =>
  workout?.estimatedDuration ?? estimateDuration(workout?.exercises);

/** "6–10" para faixas ou "10" para repetições fixas. */
export function formatReps(item) {
  if (!item) return '';
  const max = item.repetitionsMax;
  return max && max !== item.repetitions ? `${item.repetitions}–${max}` : `${item.repetitions}`;
}

/** Topo da faixa de repetições do item. */
export const topOfRange = (item) => item?.repetitionsMax ?? item?.repetitions ?? 0;

/** 150 -> "2:30" */
export function formatRest(seconds = 0) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
