import { ChevronRight, Dumbbell } from 'lucide-react';
import UserAvatar from './UserAvatar';
import Button from './Button';
import { USERS } from '@/data/users';
import './UserSelectScreen.scss';

/**
 * "Quem está treinando hoje?" — exibida no primeiro acesso e ao trocar de usuário.
 * Não é login: apenas define de quem são os dados exibidos neste aparelho.
 */
export default function UserSelectScreen({ currentUserId, onSelect, onCancel }) {
  return (
    <div className="user-select">
      <div className="user-select__panel">
        <span className="user-select__logo">
          <Dumbbell size={26} strokeWidth={2} />
        </span>
        <h1>Quem está treinando hoje?</h1>
        <p className="secondary-text">Cada um tem seus próprios treinos, cargas e evolução.</p>

        <div className="user-select__options">
          {USERS.map((user) => (
            <button
              key={user.id}
              type="button"
              className={`user-select__option ${user.id === currentUserId ? 'is-current' : ''}`}
              onClick={() => onSelect(user.id)}
            >
              <UserAvatar userId={user.id} name={user.name} size="lg" />
              <strong>{user.name}</strong>
              {user.id === currentUserId ? <span className="user-select__current">Atual</span> : <ChevronRight size={20} />}
            </button>
          ))}
        </div>

        {onCancel && (
          <Button variant="ghost" block onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
