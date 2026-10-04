import { initialExercises } from './exercises';
import { initialWorkouts } from './workouts';

export const initialProfile = {
  name: 'Lucas',
  height: null, // em centímetros
  goal: null,
};

export const GOALS = ['Hipertrofia', 'Emagrecimento', 'Manutenção', 'Força'];

export const MUSCLE_GROUPS = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Cardio'];

export const initialData = {
  profile: initialProfile,
  exercises: initialExercises,
  workouts: initialWorkouts,
  sessions: [],
  records: [],
  bodyWeight: [],
};
