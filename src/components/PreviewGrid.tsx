import { PreviewCard } from "./PreviewCard";

interface Section {
  index: number;
  width: number;
  height: number;
  thumbnail: string;
}

interface PreviewGridProps {
  sections: Section[];
  selectedIndices: number[];
  onToggle: (index: number) => void;
}

export function PreviewGrid({
  sections,
  selectedIndices,
  onToggle,
}: PreviewGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
      {sections.map((section) => (
        <PreviewCard
          key={section.index}
          section={section}
          isSelected={selectedIndices.includes(section.index)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
