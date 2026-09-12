import Navbar from "./Navbar";
import DropZone from "./DropZone";

export default function HeroSection({ onAnalyze }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      
      {/* Navbar overlay */}
      <Navbar />

      {/* Looping Video Background */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="object-cover w-full h-full opacity-60"
        >
          {/* Temporary placeholder video URL - ideally we replace this with an asset later */}
          <source src="https://assets.mixkit.co/videos/preview/mixkit-farmer-walking-in-a-crop-field-4277-large.mp4" type="video/mp4" />
        </video>
        {/* Dark gradient overlay so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-6 pt-32 text-center flex flex-col items-center">
        <h1 className="text-6xl md:text-8xl font-heading text-[#FCFCF7] font-medium tracking-tight mb-8 drop-shadow-2xl">
          Instantly Diagnose<br/>Your Crops
        </h1>
        <p className="text-xl md:text-2xl text-[#FCFCF7]/80 font-sans mb-14 max-w-2xl font-light leading-relaxed tracking-wide">
          Upload a clear photo of a diseased leaf and our AI will provide an immediate diagnosis and an actionable, weather-aware treatment plan.
        </p>

        {/* DropZone component handles file selection and preview */}
        <DropZone onAnalyze={onAnalyze} />
      </div>

    </div>
  );
}
