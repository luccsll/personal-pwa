import { abdominalExercises, initialExercises } from './exercises';
import { anthonyWorkouts, lucasWorkouts } from './workouts';
import { toDateKey } from '@/utils/date';

export const GOALS = ['Hipertrofia', 'Recomposição corporal', 'Emagrecimento', 'Manutenção', 'Força'];

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

/** Versão dos dados iniciais. Ao aumentar, o app atualiza os dados salvos de cada usuário. */
export const DATA_VERSION = 3;

/** Recomendação de RIR (repetições em reserva) por tipo de exercício. */
export const RIR_OPTIONS = [0, 1, 2, 3];
export const RIR_RECOMMENDATION = {
  compound: '1–3 RIR',
  isolation: '1–2 RIR',
};

const PROFILES = {
  lucas: {
    name: 'Lucas',
    age: null,
    height: null, // em centímetros
    goal: 'Hipertrofia',
    focus: '',
    cardioMinutes: 10,
  },
  anthony: {
    name: 'Anthony',
    age: 40,
    height: 176,
    goal: 'Recomposição corporal',
    focus:
      'Perder gordura/peso e ganhar massa muscular, com prioridade em desenvolver/definir o peito e reduzir gordura abdominal.',
    cardioMinutes: 20,
  },
};

/** Dados iniciais de cada usuário. Lucas e Anthony têm dados totalmente separados. */
export function getInitialData(userId) {
  if (userId === 'anthony') {
    return {
      profile: PROFILES.anthony,
      exercises: [...initialExercises, ...abdominalExercises],
      workouts: anthonyWorkouts,
      sessions: [],
      records: [],
      bodyWeight: [{ id: 'peso-inicial', weight: 80, date: toDateKey(), createdAt: new Date().toISOString() }],
    };
  }
  return {
    profile: PROFILES.lucas,
    exercises: initialExercises,
    workouts: lucasWorkouts,
    sessions: [],
    records: [],
    bodyWeight: [],
  };
}
