import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface PreviewCardProps {
  section: { index: number; width: number; height: number; thumbnail: string };
  isSelected: boolean;
  onToggle: (index: number) => void;
}

export function PreviewCard({
  section,
  isSelected,
  onToggle,
}: PreviewCardProps) {
  return (
    <Card
      className={`overflow-hidden transition-all cursor-pointer ring-offset-background ${isSelected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"}`}
      onClick={() => onToggle(section.index)}
    >
      <div className="relative aspect-square w-full bg-muted flex items-center justify-center overflow-hidden">
        {/* biome-ignore lint/performance/noImgElement: rendering raw data url */}
        <img
          src={section.thumbnail}
          alt={`Section ${section.index + 1}`}
          className="object-contain w-full h-full"
        />
        <div className="absolute top-3 left-3 flex items-center justify-center bg-background/80 backdrop-blur-md rounded-md px-2 py-1 text-xs font-medium border shadow-sm">
          #{section.index + 1}
        </div>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: click blocker */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: click blocker */}
        <div
          className="absolute top-3 right-3"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggle(section.index)}
            className="bg-background shadow-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50"
          />
        </div>
      </div>
      <CardContent className="p-3 bg-card border-t flex justify-between items-center text-xs text-muted-foreground">
        <span>Original size</span>
        <span className="font-mono">
          {section.width} × {section.height}
        </span>
      </CardContent>
    </Card>
  );
}
