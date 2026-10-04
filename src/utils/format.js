const numberFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export const formatNumber = (value) =>
  value === null || value === undefined || Number.isNaN(value) ? '—' : numberFormat.format(value);

export const formatWeight = (value) => (value === null || value === undefined ? '—' : `${formatNumber(value)} kg`);

export function formatSigned(value, suffix = '') {
  if (value === null || value === undefined) return '—';
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${formatNumber(Math.abs(value))}${suffix}`;
}

/** Aceita "80,5" ou "80.5". Retorna null se inválido. */
export function parseDecimal(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export const joinMuscleGroups = (groups = []) => groups.join(' + ');
