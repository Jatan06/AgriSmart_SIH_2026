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
    <div className="w-full">
      {!preview ? (
        <div 
          {...getRootProps()} 
          className={`flex flex-col items-center justify-center border border-dashed rounded-none p-16 cursor-pointer transition-all duration-300 ${
            isDragActive ? "border-[#30261D] bg-[#30261D]/5" : "border-[#30261D]/30 hover:border-[#30261D]/60 hover:bg-[#30261D]/5"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-10 h-10 text-[#30261D] mb-6" strokeWidth={1} />
          <p className="text-[#30261D] text-2xl font-heading tracking-wide text-center">
            {isDragActive ? "Drop the leaf image here..." : "Drag & drop a leaf image"}
          </p>
          <p className="text-[#30261D]/50 text-xs mt-4 tracking-widest uppercase text-center font-sans">
            JPG, PNG, WEBP (Max 10MB)
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-full aspect-video overflow-hidden mb-8 border border-[#30261D]/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={preview} 
              alt="Leaf preview" 
              className="object-cover w-full h-full grayscale-[20%]"
            />
            <button 
              onClick={handleClear}
              className="absolute top-4 right-4 bg-[#DBC8B7] hover:bg-[#30261D] text-[#30261D] hover:text-[#DBC8B7] p-3 transition-colors duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <Button 
            size="lg" 
            onClick={handleAnalyze}
            className="w-full text-sm uppercase tracking-widest font-sans h-16 bg-[#30261D] hover:bg-[#5A4635] text-[#DBC8B7] rounded-none transition-colors duration-300"
          >
            <Leaf className="w-4 h-4 mr-3" />
            Analyze Plant Health
          </Button>
        </div>
      )}
    </div>
  );
}
