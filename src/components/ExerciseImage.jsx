import { useEffect, useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { muscleGroupColor } from '@/utils/muscleGroups';
import './ExerciseImage.scss';

export const PLACEHOLDER_IMAGE = '/images/exercises/placeholder.jpg';

/**
 * Imagem do exercício com fallback em dois níveis:
 * 1. imagem própria (public/images/exercises/<id>.jpg)
 * 2. imagem padrão (placeholder.jpg)
 * 3. ilustração gerada em CSS, caso nenhuma imagem carregue
 */
export default function ExerciseImage({ exercise, size, className = '' }) {
  const src = exercise?.image || PLACEHOLDER_IMAGE;
  const [current, setCurrent] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrent(src);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (current !== PLACEHOLDER_IMAGE) setCurrent(PLACEHOLDER_IMAGE);
    else setFailed(true);
  };

  const name = exercise?.name ?? 'Exercício';
  const style = { '--mg-color': muscleGroupColor(exercise?.muscleGroup), ...(size ? { width: size } : {}) };

  return (
    <div className={`exercise-image ${className}`} style={style}>
      {failed ? (
        <div className="exercise-image__fallback" role="img" aria-label={name}>
          <Dumbbell strokeWidth={1.8} />
        </div>
      ) : (
        <img src={current} alt={name} loading="lazy" decoding="async" onError={handleError} />
      )}
    </div>
  );
}
