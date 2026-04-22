import { DownloadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExportBarProps {
  selectedCount: number;
  totalCount: number;
  isExporting: boolean;
  scale: number;
  setScale: (v: number) => void;
  format: string;
  setFormat: (v: string) => void;
  onExport: () => void;
}

export function ExportBar({
  selectedCount,
  totalCount,
  isExporting,
  scale,
  setScale,
  format,
  setFormat,
  onExport,
}: ExportBarProps) {
  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-background/80 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.5)] z-50 transition-all">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 justify-center">
          <div className="text-sm font-medium whitespace-nowrap">
            <span className="text-primary">{selectedCount}</span> of{" "}
            {totalCount} selected
          </div>
          <div className="h-6 w-px bg-border hidden sm:block"></div>
          <Select
            value={format}
            onValueChange={(v) => {
              if (v) setFormat(v);
            }}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="original">Original size</SelectItem>
              <SelectItem value="ig-square">IG Square (1:1)</SelectItem>
              <SelectItem value="ig-portrait">IG Portrait (4:5)</SelectItem>
              <SelectItem value="ig-story">IG Story (9:16)</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={scale.toString()}
            onValueChange={(v) => {
              if (v) setScale(Number(v));
            }}
          >
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Scale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1x (Standard)</SelectItem>
              <SelectItem value="2">2x (Retina)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          size="lg"
          onClick={onExport}
          disabled={isExporting || selectedCount === 0}
          className="w-full sm:w-auto font-semibold px-8 shadow-primary/25 shadow-lg"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Rendering...
            </>
          ) : (
            <>
              <DownloadCloud className="mr-2 h-5 w-5" />
              Export {selectedCount} {selectedCount === 1 ? "image" : "images"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
