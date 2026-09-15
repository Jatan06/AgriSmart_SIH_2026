import { useLanguage } from "@/context/LanguageContext";

export default function ImpactSection({ data }) {
  const { t } = useLanguage();

  const impact = data?.agent_advice?.sustainability_impact || {
    chemical_reduction_percent: 32,
    water_saved_liters_per_acre: 420,
    methodology_note: "Based on standard localized spraying guidelines."
  };

  const chemRed = impact.chemical_reduction_percent || 0;
  const waterSaved = impact.water_saved_liters_per_acre || 0;
  const methodology = impact.methodology_note || "";

  return (
    <section id="insights" className="w-full bg-paper text-coffee py-12 md:py-16 px-6 md:px-16 border-b border-coffee/10">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        
        <div className="font-sans text-xs md:text-sm tracking-[0.2em] uppercase text-coffee/50 mb-4 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-olive rounded-full animate-pulse"></div>
          {t('environmental_impact')}
        </div>
        
        <h2 className="font-heading text-4xl md:text-6xl leading-none text-coffee mb-10">
          {t('lighter_choice') || "Sustainability Impact"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
          <div className="flex flex-col items-center">
            <span className="font-sans text-xs md:text-sm uppercase tracking-widest text-coffee/60 mb-2">{t('chemical_reduction') || "Chemical Reduction"}</span>
            <div className="font-heading text-5xl md:text-7xl text-olive font-light">−{chemRed}%</div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-sans text-xs md:text-sm uppercase tracking-widest text-coffee/60 mb-2">{t('water_saved') || "Water Saved"}</span>
            <div className="font-heading text-5xl md:text-7xl text-olive font-light">~{waterSaved} <span className="text-4xl md:text-6xl">{t('liters') || "Liters"}</span></div>
          </div>
        </div>

        {/* SIH Compliance: Publish the exact methodology/rules */}
        <div className="w-full max-w-2xl mx-auto text-center mt-4">
          <div className="font-sans text-[10px] md:text-xs tracking-widest uppercase text-coffee/40 mb-2">
            Algorithm Methodology
          </div>
          <p className="font-sans text-sm text-coffee/60 font-light italic">
            "{methodology}"
          </p>
        </div>

      </div>
    </section>
  );
}
