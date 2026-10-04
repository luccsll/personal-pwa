const COLOR_BY_GROUP = {
  peito: 'var(--mg-chest)',
  costas: 'var(--mg-back)',
  pernas: 'var(--mg-legs)',
  ombros: 'var(--mg-shoulders)',
  biceps: 'var(--mg-biceps)',
  triceps: 'var(--mg-triceps)',
  abdomen: 'var(--mg-abs)',
  cardio: 'var(--mg-cardio)',
};

export function muscleGroupColor(group = '') {
  const key = group
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  return COLOR_BY_GROUP[key] ?? 'var(--primary-500)';
}
