export const WEEK_DAYS = [
  { index: 1, short: 'SEG', label: 'Segunda' },
  { index: 2, short: 'TER', label: 'Terça' },
  { index: 3, short: 'QUA', label: 'Quarta' },
  { index: 4, short: 'QUI', label: 'Quinta' },
  { index: 5, short: 'SEX', label: 'Sexta' },
  { index: 6, short: 'SÁB', label: 'Sábado' },
  { index: 0, short: 'DOM', label: 'Domingo' },
];

export const dayLabel = (dayOfWeek) => WEEK_DAYS.find((d) => d.index === dayOfWeek)?.label ?? '';

/** Data local no formato YYYY-MM-DD (sem conversão para UTC). */
export function toDateKey(date = new Date()) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Converte "YYYY-MM-DD" ou ISO em Date local. */
export function parseDate(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}

/** Segunda-feira da semana da data informada, como YYYY-MM-DD. */
export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return toDateKey(d);
}

export const formatShortDate = (value) =>
  parseDate(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

export const formatDate = (value) =>
  parseDate(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatLongDate = (value) =>
  parseDate(value).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

export const formatTime = (value) =>
  new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export function formatDuration(minutes) {
  if (minutes === null || minutes === undefined) return '—';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia!';
  if (hour >= 12 && hour < 18) return 'Boa tarde!';
  return 'Boa noite!';
}

export function diffInMinutes(start, end) {
  return Math.max(0, Math.round((new Date(end) - new Date(start)) / 60000));
}
