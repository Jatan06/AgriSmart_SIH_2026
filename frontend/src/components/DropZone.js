import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DropZone({ onAnalyze }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      // Create a local URL for the preview image
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles: 1
  });

  const handleClear = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFile(null);
  };

  const handleAnalyze = (e) => {
    e.stopPropagation();
    if (file) {
      onAnalyze(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto backdrop-blur-xl bg-white/5 p-10 rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
      
      {!preview ? (
        <div 
          {...getRootProps()} 
          className={`flex flex-col items-center justify-center border border-dashed rounded-2xl p-16 cursor-pointer transition-all duration-500 ease-out ${
            isDragActive ? "border-primary/80 bg-primary/20 scale-105" : "border-white/30 hover:border-white/60 hover:bg-white/5"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-16 h-16 text-white/80 mb-6 animate-pulse" strokeWidth={1} />
          <p className="text-white text-xl font-heading tracking-wide text-center drop-shadow-md">
            {isDragActive ? "Drop the leaf image here..." : "Drag & drop a leaf image, or click to browse"}
          </p>
          <p className="text-white/50 text-sm mt-3 tracking-widest uppercase text-center font-sans">
            Supports JPG, PNG, WEBP up to 10MB
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8 shadow-2xl border border-white/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={preview} 
              alt="Leaf preview" 
              className="object-cover w-full h-full"
            />
            <button 
              onClick={handleClear}
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-md transition-all duration-300 hover:rotate-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <Button 
            size="lg" 
            onClick={handleAnalyze}
            className="w-full text-xl font-heading h-16 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(145,145,102,0.4)] transition-all duration-300 hover:scale-[1.02]"
          >
            <Leaf className="w-6 h-6 mr-3" />
            Analyze Plant Health
          </Button>
        </div>
      )}
    </div>
  );
}
