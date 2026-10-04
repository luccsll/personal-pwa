import { CalendarDays, ChartNoAxesCombined, Dumbbell, House, Scale, User } from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Início', icon: House, route: '/' },
  { label: 'Treinos', icon: Dumbbell, route: '/treinos' },
  { label: 'Evolução', icon: ChartNoAxesCombined, route: '/evolucao' },
  { label: 'Histórico', icon: CalendarDays, route: '/historico' },
];

export const SIDEBAR_EXTRA_ITEMS = [
  { label: 'Meu peso', icon: Scale, route: '/peso' },
  { label: 'Meus dados', icon: User, route: '/perfil' },
];
