import { initialExercises } from './exercises';
import { initialWorkouts } from './workouts';

export const initialProfile = {
  name: 'Lucas',
  height: null, // em centímetros
  goal: 'Hipertrofia',
};

export const GOALS = ['Hipertrofia', 'Emagrecimento', 'Manutenção', 'Força'];

export const MUSCLE_GROUPS = [
  'Peito',
  'Costas',
  'Ombros',
  'Ombro posterior',
  'Bíceps',
  'Tríceps',
  'Pernas',
  'Quadríceps',
  'Posterior de coxa',
  'Glúteos',
  'Panturrilha',
  'Abdômen',
  'Cardio',
];

/** Versão dos dados iniciais. Ao aumentar, o app atualiza treinos e exercícios salvos. */
export const DATA_VERSION = 2;

/** Recomendação de RIR (repetições em reserva) por tipo de exercício. */
export const RIR_OPTIONS = [0, 1, 2, 3];
export const RIR_RECOMMENDATION = {
  compound: '1–3 RIR',
  isolation: '1–2 RIR',
};

export const initialData = {
  profile: initialProfile,
  exercises: initialExercises,
  workouts: initialWorkouts,
  sessions: [],
  records: [],
  bodyWeight: [],
};
