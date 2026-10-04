const normalize = (text = '') =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

// Ordem importa: "ombro posterior" deve casar antes de "posterior" (coxa).
const COLOR_RULES = [
  ['peito', 'var(--mg-chest)'],
  ['costas', 'var(--mg-back)'],
  ['ombro', 'var(--mg-shoulders)'],
  ['biceps', 'var(--mg-biceps)'],
  ['triceps', 'var(--mg-triceps)'],
  ['pernas', 'var(--mg-legs)'],
  ['quadriceps', 'var(--mg-legs)'],
  ['posterior', 'var(--mg-legs)'],
  ['gluteo', 'var(--mg-legs)'],
  ['panturrilha', 'var(--mg-legs)'],
  ['abdomen', 'var(--mg-abs)'],
  ['cardio', 'var(--mg-cardio)'],
];

export function muscleGroupColor(group = '') {
  const key = normalize(group);
  return COLOR_RULES.find(([word]) => key.includes(word))?.[1] ?? 'var(--primary-500)';
}
