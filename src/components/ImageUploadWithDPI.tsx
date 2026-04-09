import { useState, useRef, useCallback } from "react";
import { Upload, AlertTriangle, CheckCircle, X, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DPIResult {
  width: number;
  height: number;
  dpi: number;
  quality: "low" | "medium" | "premium";
}

interface ImageUploadProps {
  onImageUpload: (file: File, preview: string, dpiResult: DPIResult) => void;
  printWidthInches?: number;
  printHeightInches?: number;
}

const ImageUploadWithDPI = ({ onImageUpload, printWidthInches = 3.5, printHeightInches = 2 }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dpiResult, setDpiResult] = useState<DPIResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const checkDPI = useCallback((file: File) => {
    const img = new window.Image();
    img.onload = () => {
      const dpiX = Math.round(img.width / printWidthInches);
      const dpiY = Math.round(img.height / printHeightInches);
      const avgDpi = Math.round((dpiX + dpiY) / 2);

      let quality: "low" | "medium" | "premium" = "medium";
      if (avgDpi < 150) quality = "low";
      else if (avgDpi >= 300) quality = "premium";

      const result: DPIResult = { width: img.width, height: img.height, dpi: avgDpi, quality };
      setDpiResult(result);

      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onImageUpload(file, previewUrl, result);
    };
    img.src = URL.createObjectURL(file);
  }, [printWidthInches, printHeightInches, onImageUpload]);

  const handleFile = (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      alert("File size must be under 25MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    checkDPI(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    setDpiResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground block">Upload Your Design</label>

      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            dragOver
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-secondary/50"
          }`}
        >
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground mb-1">Drop your image here or click to upload</p>
          <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to 25MB</p>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border bg-secondary">
          <img src={preview} alt="Preview" className="w-full h-48 object-contain bg-secondary" />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* DPI Result */}
      {dpiResult && (
        <div
          className={`rounded-xl p-3 flex items-start gap-3 animate-fade-in ${
            dpiResult.quality === "low"
              ? "bg-destructive/10 border border-destructive/20"
              : dpiResult.quality === "premium"
              ? "bg-primary/10 border border-primary/20"
              : "bg-amber-500/10 border border-amber-500/20"
          }`}
        >
          {dpiResult.quality === "low" ? (
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          ) : dpiResult.quality === "premium" ? (
            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          ) : (
            <ImageIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-medium">
              {dpiResult.quality === "low"
                ? "⚠️ Low Quality — Print may appear blurry"
                : dpiResult.quality === "premium"
                ? "✨ Premium Quality — Perfect for printing!"
                : "👍 Acceptable Quality — Good enough for printing"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {dpiResult.width}×{dpiResult.height}px · ~{dpiResult.dpi} DPI
            </p>
            {dpiResult.quality === "low" && (
              <p className="text-xs text-destructive mt-1">
                Please upload a higher resolution file for best results.
              </p>
            )}
          </div>
          <Badge
            className={`ml-auto flex-shrink-0 ${
              dpiResult.quality === "low"
                ? "bg-destructive text-destructive-foreground"
                : dpiResult.quality === "premium"
                ? "bg-primary text-primary-foreground"
                : "bg-amber-500 text-white"
            } rounded-lg text-[10px]`}
          >
            {dpiResult.quality === "premium" ? "300+ DPI" : `~${dpiResult.dpi} DPI`}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default ImageUploadWithDPI;
