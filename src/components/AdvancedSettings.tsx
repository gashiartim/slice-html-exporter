import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdvancedSettingsProps {
  selector: string;
  setSelector: (s: string) => void;
  onAutoDetect: () => void;
  isDetecting: boolean;
}

export function AdvancedSettings({
  selector,
  setSelector,
  onAutoDetect,
  isDetecting,
}: AdvancedSettingsProps) {
  return (
    <div className="space-y-4 mb-6 p-4 rounded-lg bg-card border">
      <div>
        <Label htmlFor="selector" className="text-sm font-medium">
          CSS Selector
        </Label>
        <div className="flex flex-col sm:flex-row gap-3 mt-1.5">
          <Input
            id="selector"
            value={selector}
            onChange={(e) => setSelector(e.target.value)}
            placeholder=".slide"
            className="max-w-md font-mono"
          />
          <Button
            variant="secondary"
            onClick={onAutoDetect}
            disabled={isDetecting}
            className="sm:w-auto"
          >
            {isDetecting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2 text-primary" />
            )}
            Auto-detect with AI
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Elements matching this selector will be extracted.
        </p>
      </div>
    </div>
  );
}
