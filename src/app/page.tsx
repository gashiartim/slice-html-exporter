"use client";

import { Loader2, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdvancedSettings } from "@/components/AdvancedSettings";
import { Dropzone } from "@/components/Dropzone";
import { ExportBar } from "@/components/ExportBar";
import { PreviewGrid } from "@/components/PreviewGrid";
import { Button } from "@/components/ui/button";

interface Section {
  index: number;
  width: number;
  height: number;
  thumbnail: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [selector, setSelector] = useState(".slide");
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [exportFormat, setExportFormat] = useState("original");
  const [exportScale, setExportScale] = useState(2);
  const [showSettings, setShowSettings] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [baseFilename, setBaseFilename] = useState("slice-export");

  const handleAutoDetect = async () => {
    if (!file) return;
    setIsDetecting(true);
    const toastId = toast.loading("AI is analyzing your file...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/suggest-selector", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to detect selector");
      }

      if (data.filename) {
        setBaseFilename(data.filename);
      }
      setSelector(data.selector);
      toast.success(`AI suggested: "${data.selector}" and filename "${data.filename || "slice-export"}"`, { id: toastId });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Auto-detect failed: ${message}`, { id: toastId });
    } finally {
      setIsDetecting(false);
    }
  };

  const parseFile = async (selectedFile: File, activeSelector: string) => {
    setIsParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("selector", activeSelector);

      const res = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse file");
      }

      setSections(data.sections || []);
      setSelectedIndices((data.sections || []).map((s: Section) => s.index));
      toast.success(`Found ${data.sections?.length || 0} sections!`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(message);
      setSections([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDropFile = (newFile: File) => {
    setFile(newFile);
    parseFile(newFile, selector);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only re-run on selector changes
  useEffect(() => {
    if (file && selector) {
      const timer = setTimeout(() => {
        parseFile(file, selector);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [selector]);

  const handleToggleSection = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleExport = async () => {
    if (!file || selectedIndices.length === 0) return;

    setIsExporting(true);
    const toastId = toast.loading("Rendering images...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("selector", selector);
      formData.append("filename", baseFilename);
      formData.append("indices", JSON.stringify(selectedIndices));
      formData.append(
        "settings",
        JSON.stringify({
          format: exportFormat,
          scale: exportScale,
        }),
      );

      const res = await fetch("/api/export", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to export");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Auto download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseFilename}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast.success("Export complete!", {
        id: toastId,
        action: {
          label: "Download again",
          onClick: () => {
            const a2 = document.createElement("a");
            a2.href = url;
            a2.download = `${baseFilename}.zip`;
            a2.click();
          },
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Export failed: ${message}`, { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full pb-20">
      {!file ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            <Dropzone onDropFile={handleDropFile} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Preview</h2>
              <p className="text-muted-foreground text-sm">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings2 className="w-4 h-4" />
                Settings
              </Button>
              <Dropzone onDropFile={handleDropFile} isCompact />
            </div>
          </div>

          {showSettings && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <AdvancedSettings
                selector={selector}
                setSelector={setSelector}
                onAutoDetect={handleAutoDetect}
                isDetecting={isDetecting}
              />
            </div>
          )}

          {isParsing ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">
                Slicing your file...
              </p>
            </div>
          ) : sections.length > 0 ? (
            <PreviewGrid
              sections={sections}
              selectedIndices={selectedIndices}
              onToggle={handleToggleSection}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl border-muted-foreground/25 bg-muted/50">
              <p className="text-muted-foreground">
                No sections found matching "{selector}".
              </p>
            </div>
          )}

          <ExportBar
            selectedCount={selectedIndices.length}
            totalCount={sections.length}
            isExporting={isExporting}
            scale={exportScale}
            setScale={setExportScale}
            format={exportFormat}
            setFormat={setExportFormat}
            onExport={handleExport}
          />
        </div>
      )}
    </div>
  );
}
