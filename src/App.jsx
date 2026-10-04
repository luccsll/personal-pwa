import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppDataProvider, useAppData } from '@/hooks/useAppData';
import UserSelectScreen from '@/components/UserSelectScreen';
import MainLayout from '@/layouts/MainLayout';
import FocusLayout from '@/layouts/FocusLayout';
import DashboardPage from '@/pages/DashboardPage';
import WorkoutsPage from '@/pages/WorkoutsPage';
import WorkoutDetailsPage from '@/pages/WorkoutDetailsPage';
import WorkoutEditorPage from '@/pages/WorkoutEditorPage';
import ExerciseDetailsPage from '@/pages/ExerciseDetailsPage';
import WorkoutExecutionPage from '@/pages/WorkoutExecutionPage';
import EvolutionPage from '@/pages/EvolutionPage';
import BodyWeightPage from '@/pages/BodyWeightPage';
import HistoryPage from '@/pages/HistoryPage';
import HistoryDetailsPage from '@/pages/HistoryDetailsPage';
import ProfilePage from '@/pages/ProfilePage';
import SwitchUserPage from '@/pages/SwitchUserPage';

/** No primeiro acesso pergunta quem está treinando antes de abrir o app. */
function AppRoutes() {
  const { needsUserSelection, selectUser } = useAppData();
  if (needsUserSelection) return <UserSelectScreen onSelect={selectUser} />;

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/treinos" element={<WorkoutsPage />} />
        <Route path="/treinos/novo" element={<WorkoutEditorPage />} />
        <Route path="/treinos/:id" element={<WorkoutDetailsPage />} />
        <Route path="/treinos/:id/editar" element={<WorkoutEditorPage />} />
        <Route path="/exercicios/:id" element={<ExerciseDetailsPage />} />
        <Route path="/evolucao" element={<EvolutionPage />} />
        <Route path="/peso" element={<BodyWeightPage />} />
        <Route path="/historico" element={<HistoryPage />} />
        <Route path="/historico/:sessionId" element={<HistoryDetailsPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Route>
      <Route element={<FocusLayout />}>
        <Route path="/treino/:sessionId" element={<WorkoutExecutionPage />} />
        <Route path="/trocar-usuario" element={<SwitchUserPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppDataProvider>
  );
}
