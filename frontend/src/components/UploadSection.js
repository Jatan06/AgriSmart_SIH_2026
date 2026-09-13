"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function UploadSection({ onAnalyze }) {
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // GSAP smooth image reveal
      gsap.fromTo(".image-preview", 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );

      // Compress and pass up
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      
      try {
        const compressedFile = await imageCompression(file, options);
        // We delay analysis slightly for the GSAP animation to finish feeling smooth
        setTimeout(() => {
          onAnalyze(compressedFile);
        }, 1000);
      } catch (error) {
        console.error("Compression error:", error);
        onAnalyze(file); 
      }
    }
  }, [onAnalyze]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10485760, // 10MB
    multiple: false
  });

  return (
    <section id="analyze-section" className="w-full bg-paper text-coffee py-16 px-6 md:px-16 flex flex-col justify-center">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* Editorial Heading */}
        <div className="mb-12 text-center md:text-left">
          <h2 className="font-heading text-[clamp(3rem,6vw,5rem)] leading-none mb-4 font-light">
            Analyze your crop.
          </h2>
          <p className="font-sans text-base md:text-lg font-light text-coffee/70 max-w-lg">
            Upload a clear photograph of a crop leaf to begin a detailed field analysis.
          </p>
        </div>

        {/* Contained Field Inspection Surface - VERY COMPACT */}
        <div 
          {...getRootProps()} 
          className={`relative w-full max-w-xl mx-auto aspect-[21/9] border ${
            isDragActive ? "border-olive bg-olive/5" : "border-coffee/20 hover:border-coffee/40 hover:bg-coffee/[0.02]"
          } transition-all duration-700 ease-out cursor-pointer flex flex-col items-center justify-center group overflow-hidden`}
        >
          <input {...getInputProps()} />

          {!preview ? (
            <div className="flex flex-col items-center text-center z-10 p-6">
              <svg 
                className={`w-10 h-10 mb-6 transition-colors duration-500 ${isDragActive ? "text-olive" : "text-coffee/40 group-hover:text-coffee/80"}`}
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1"
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="square"/>
              </svg>
              
              <span className="font-sans text-xs tracking-[0.2em] uppercase text-coffee/60 mb-2">
                Drop Leaf Image
              </span>
              <span className="font-heading text-2xl md:text-3xl text-coffee/40 group-hover:text-coffee transition-colors duration-500">
                {isDragActive ? "Release to analyze" : "Click or drag anywhere"}
              </span>

              <div className="absolute bottom-4 left-4 font-sans text-[10px] tracking-widest uppercase text-coffee/40">
                JPG &middot; PNG &middot; WEBP
              </div>
              <div className="absolute bottom-4 right-4 font-sans text-[10px] tracking-widest uppercase text-coffee/40">
                MAX 10MB
              </div>
            </div>
          ) : (
            <div className="image-preview absolute inset-0 w-full h-full p-3 md:p-6">
              <img 
                src={preview} 
                alt="Leaf preview" 
                className="w-full h-full object-cover grayscale-[10%]"
              />
              <div className="absolute inset-0 bg-coffee/10 mix-blend-multiply"></div>
              
              <div className="absolute top-8 left-8 font-sans text-xs tracking-widest uppercase text-paper bg-coffee/80 px-4 py-2">
                Field Analysis
              </div>
              <div className="absolute top-8 right-8 font-sans text-xs tracking-widest uppercase text-paper bg-coffee/80 px-4 py-2">
                AI Vision
              </div>
            </div>
          )}
          
        </div>

      </div>
    </section>
  );
}
