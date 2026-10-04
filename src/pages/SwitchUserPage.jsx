import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/hooks/useAppData';
import UserSelectScreen from '@/components/UserSelectScreen';

/** "Trocar usuário": muda apenas o usuário ativo, sem apagar os dados do outro. */
export default function SwitchUserPage() {
  const navigate = useNavigate();
  const { userId, selectUser } = useAppData();

  return (
    <UserSelectScreen
      currentUserId={userId}
      onSelect={(id) => {
        if (id !== userId) selectUser(id);
        navigate('/', { replace: true });
      }}
      onCancel={() => navigate(-1)}
    />
  );
}
