import { UploadCloud } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  onDropFile: (file: File) => void;
  isCompact?: boolean;
}

export function Dropzone({ onDropFile, isCompact }: DropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onDropFile(acceptedFiles[0]);
      }
    },
    [onDropFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/html": [".html"],
      "application/zip": [".zip"],
    },
    maxFiles: 1,
  });

  if (isCompact) {
    return (
      <div
        {...getRootProps()}
        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-4 w-4" />
        Replace file
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center w-full h-[400px] border-2 border-dashed rounded-xl cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 bg-card hover:bg-accent/50 hover:border-primary/50",
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center space-y-4">
        <div className="p-4 rounded-full bg-primary/10 text-primary">
          <UploadCloud className="w-10 h-10" />
        </div>
        <div>
          <p className="mb-2 text-xl font-semibold">Drop an HTML file or ZIP</p>
          <p className="text-sm text-muted-foreground">
            We'll slice it into publish-ready images.
          </p>
        </div>
      </div>
    </div>
  );
}
