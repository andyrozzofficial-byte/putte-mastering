/** Compact trust block between hero and feature strip (homepage only). */
export function HeroTrustSection() {
  return (
    <section
      className="bg-white py-7 sm:py-8 md:py-9"
      aria-labelledby="hero-trust-quote"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="max-w-xl space-y-4 sm:max-w-2xl sm:space-y-5">
          <blockquote className="not-italic">
            <p
              id="hero-trust-quote"
              className="text-[15px] font-medium leading-[1.55] tracking-[-0.02em] text-black sm:text-[16px] sm:leading-snug"
            >
              A good master won&apos;t fix a bad song — but it can make a great
              one impossible to ignore.
            </p>
          </blockquote>
          <p className="text-[13px] leading-[1.7] text-gray-600 sm:text-[14px] sm:leading-relaxed">
            Pontus &apos;Oneye&apos; Kalm is a multifaceted producer and
            songwriter with over 3.5 billion streams across records he has
            produced and written. Known for his work with globally renowned
            artists such as BTS, NCT Dream, and NCT Wish, Pontus has established
            himself as a standout creative force in the global music industry.
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            3.5B+ streams • BTS • NCT Dream • NCT Wish • Manual mastering
          </p>
        </div>
      </div>
    </section>
  );
}
