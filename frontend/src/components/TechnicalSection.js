import { useLanguage } from "@/context/LanguageContext";

export default function TechnicalSection() {
  const { t } = useLanguage();

  return (
    <section id="how-it-works" className="w-full bg-paper text-coffee py-8 md:py-12 px-6 md:px-16">
      <div className="max-w-4xl mx-auto border-t border-coffee/20 pt-8">
        
        <div className="font-sans text-xs md:text-sm tracking-[0.2em] uppercase text-coffee/50 mb-6">
          {t('technical_explanation')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-sans font-light text-coffee/80 leading-relaxed text-base">
          <div>
            <h4 className="font-sans font-medium text-coffee mb-3">{t('cv_architecture')}</h4>
            <p className="mb-6">
              {t('cv_desc')}
            </p>
          </div>
          <div>
            <h4 className="font-sans font-medium text-coffee mb-3">{t('contextual_arbitration')}</h4>
            <p className="mb-6">
              {t('contextual_desc')}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
