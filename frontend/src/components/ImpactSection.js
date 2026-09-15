import { useLanguage } from "@/context/LanguageContext";

export default function ImpactSection() {
  const { t } = useLanguage();

  return (
    <section id="insights" className="w-full bg-paper text-coffee py-12 md:py-16 px-6 md:px-16 border-b border-coffee/10">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        
        <div className="font-sans text-xs md:text-sm tracking-[0.2em] uppercase text-coffee/50 mb-4">
          {t('environmental_impact')}
        </div>
        
        <h2 className="font-heading text-4xl md:text-6xl leading-none text-coffee mb-10">
          {t('lighter_choice')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
          <div className="flex flex-col items-center">
            <span className="font-sans text-xs md:text-sm uppercase tracking-widest text-coffee/60 mb-2">{t('chemical_reduction')}</span>
            <div className="font-heading text-5xl md:text-7xl text-olive font-light">−32%</div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-sans text-xs md:text-sm uppercase tracking-widest text-coffee/60 mb-2">{t('water_saved')}</span>
            <div className="font-heading text-5xl md:text-7xl text-olive font-light">~420 <span className="text-4xl md:text-6xl">{t('liters')}</span></div>
          </div>
        </div>

        {/* Minimal Horizontal Comparison */}
        <div className="w-full max-w-2xl mx-auto text-left">
          <div className="font-sans text-xs md:text-sm tracking-widest uppercase text-coffee/40 mb-6 text-center">
            {t('compared_with_conventional')}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between font-sans text-sm md:text-base uppercase tracking-widest text-coffee/60 mb-2">
                <span>{t('conventional')}</span>
              </div>
              <div className="w-full bg-coffee/5 h-1">
                <div className="bg-coffee/30 h-full w-[90%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-sans text-sm md:text-base uppercase tracking-widest text-olive mb-2">
                <span>{t('agrismart')}</span>
              </div>
              <div className="w-full bg-coffee/5 h-1">
                <div className="bg-olive h-full w-[58%]"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
