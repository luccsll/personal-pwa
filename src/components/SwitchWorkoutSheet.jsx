import Modal from './Modal';
import WorkoutCard from './WorkoutCard';
import { optionLabel } from '@/utils/workout';

/** Lista as opções de treino de um dia para trocar o treino principal pelo alternativo. */
export default function SwitchWorkoutSheet({ open, dayLabel, options, selectedId, onSelect, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Trocar treino"
      description={`Escolha uma alternativa para ${dayLabel ? dayLabel.toLowerCase() : 'hoje'}.`}
    >
      {options.map((workout, index) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          label={`${optionLabel(index)}${workout.type === 'primary' ? ' · Principal' : ''}`}
          selected={workout.id === selectedId}
          onClick={() => {
            onSelect(workout.id);
            onClose();
          }}
        />
      ))}
    </Modal>
  );
}
