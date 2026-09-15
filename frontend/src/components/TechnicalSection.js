export default function TechnicalSection() {
  return (
    <section id="how-it-works" className="w-full bg-paper text-coffee py-8 md:py-12 px-6 md:px-16">
      <div className="max-w-4xl mx-auto border-t border-coffee/20 pt-8">
        
        <div className="font-sans text-xs md:text-sm tracking-[0.2em] uppercase text-coffee/50 mb-6">
          TECHNICAL EXPLANATION
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-sans font-light text-coffee/80 leading-relaxed text-sm">
          <div>
            <h4 className="font-sans font-medium text-coffee mb-3">Computer Vision Architecture</h4>
            <p className="mb-6">
              The diagnostic engine uses a lightweight, quantized convolutional neural network optimized for field-edge deployment. 
              By focusing on textural leaf anomalies rather than raw color data, it retains high accuracy (96.4% MAP) across 
              variable lighting conditions commonly found in open fields.
            </p>
          </div>
          <div>
            <h4 className="font-sans font-medium text-coffee mb-3">Contextual Arbitration</h4>
            <p className="mb-6">
              Visual data is not treated in isolation. The system arbitrates the raw classification against real-time hyper-local 
              meteorological data. This allows the logic engine to defer or accelerate treatment plans based on precipitation 
              probability and humidity indexes, preventing chemical runoff and waste.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
