import './UserAvatar.scss';

/** Inicial do usuário (L → Lucas, A → Anthony). */
export default function UserAvatar({ userId, name, size = 'md' }) {
  const initial = (name || userId || '?').charAt(0).toUpperCase();
  return (
    <span className={`user-avatar user-avatar--${size} user-avatar--${userId}`} aria-hidden>
      {initial}
    </span>
  );
}
