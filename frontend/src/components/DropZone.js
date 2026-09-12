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
    <div className="w-full max-w-2xl mx-auto backdrop-blur-md bg-white/10 p-8 rounded-3xl border border-white/20 shadow-2xl">
      
      {!preview ? (
        <div 
          {...getRootProps()} 
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all duration-300 ${
            isDragActive ? "border-white bg-white/20 scale-105" : "border-white/50 hover:border-white hover:bg-white/10"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-16 h-16 text-white mb-4 animate-bounce" />
          <p className="text-white text-lg font-medium text-center">
            {isDragActive ? "Drop the leaf image here..." : "Drag & drop a leaf image, or click to browse"}
          </p>
          <p className="text-white/60 text-sm mt-2 text-center">Supports JPG, PNG, WEBP up to 10MB</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 shadow-lg border-2 border-white/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={preview} 
              alt="Leaf preview" 
              className="object-cover w-full h-full"
            />
            <button 
              onClick={handleClear}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <Button 
            size="lg" 
            onClick={handleAnalyze}
            className="w-full text-lg h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
          >
            <Leaf className="w-5 h-5 mr-2" />
            Analyze Plant Health
          </Button>
        </div>
      )}
    </div>
  );
}
