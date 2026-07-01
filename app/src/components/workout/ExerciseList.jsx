import { ExerciseCard } from "./ExerciseCard";

export function ExerciseList({ exItems, currentSet, onVideoClick, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, overflowY: "auto" }}>
      {exItems.map((item) => (
        <ExerciseCard
          key={item.name}
          item={item}
          currentSet={currentSet}
          onVideoClick={onVideoClick}
          onSelect={onSelect ? () => onSelect(item.idx) : undefined}
        />
      ))}
    </div>
  );
}
