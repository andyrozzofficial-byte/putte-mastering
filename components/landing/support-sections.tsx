export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Ladda upp",
      text: "WAV, AIFF eller FLAC — behåll headroom så vi kan arbeta med dynamiken.",
    },
    {
      step: "02",
      title: "Manuell finishing",
      text: "Jag lyssnar i rumskalibrerade monitorer och finjusterar nivå, tonalitet och punch.",
    },
    {
      step: "03",
      title: "Leverans",
      text: "Du får masterfiler redo för streaming och nedladdning, med tydlig återkoppling.",
    },
  ];

  return (
    <section
      id="hur"
      className="border-t border-gray-100 bg-white py-14 md:py-20"
      aria-labelledby="hur-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="max-w-2xl space-y-2">
          <h2
            id="hur-heading"
            className="text-[1.375rem] font-semibold tracking-tight text-black sm:text-2xl md:text-[1.65rem]"
          >
            Så fungerar det
          </h2>
          <p className="text-[13px] leading-relaxed text-gray-600 sm:text-sm">
            En rak process utan automatiska kedjor — bara lyssning, omdöme och
            hantverk.
          </p>
        </div>
        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6 md:gap-y-8">
          {steps.map(({ step, title, text }) => (
            <li key={step} className="space-y-2">
              <span className="text-[11px] font-semibold tabular-nums text-gray-400">
                {step}
              </span>
              <h3 className="text-[15px] font-semibold text-black sm:text-base">
                {title}
              </h3>
              <p className="text-[13px] leading-relaxed text-gray-600 sm:text-sm">
                {text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PricingTeaserSection() {
  return (
    <section
      id="priser"
      className="border-t border-gray-100 bg-neutral-50/80 py-14 md:py-16"
      aria-labelledby="priser-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <h2
          id="priser-heading"
          className="text-[1.375rem] font-semibold tracking-tight text-black sm:text-2xl md:text-[1.65rem]"
        >
          Priser
        </h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-gray-600 sm:text-sm">
          Offert baseras på antal spår, längd och önskade leveranser. Inga dolda
          avgifter — du får ett tydligt besked innan vi startar.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-5">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-[13px] font-medium text-gray-500 sm:text-sm">
              Standard Master
            </p>
            <p className="mt-1.5 text-[13px] text-gray-600 sm:text-sm">
              En låt, stereo-master, testlyssning ingår.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-[13px] font-medium text-gray-500 sm:text-sm">
              Premium Master
            </p>
            <p className="mt-1.5 text-[13px] text-gray-600 sm:text-sm">
              EP/album, revisionspass och prioriterad kö vid behov.
            </p>
          </div>
        </div>
        <p className="mt-6 text-[13px] text-gray-500 sm:text-sm">
          Kontakta för exakt pris — vi återkommer inom kort.
        </p>
      </div>
    </section>
  );
}

export function FaqSection() {
  const faqs = [
    {
      q: "Vilka filformat ska jag skicka?",
      a: "Helst 24-bit WAV eller AIFF utan limiter på masterbussen. Högupplöst ger bäst utrymme att forma slutlig nivå och klarhet.",
    },
    {
      q: "Hur lång är leveranstiden?",
      a: "Vanligtvis 2–3 arbetsdagar. Vid tight deadline finns express mot tillägg.",
    },
    {
      q: "Får jag ändringar efter första master?",
      a: "Ja. Vi landar alltid i en version du är nöjd med inom rimliga revisionsramar.",
    },
  ];

  return (
    <section
      id="faq"
      className="border-t border-gray-100 bg-white py-14 md:py-16"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-10">
        <h2
          id="faq-heading"
          className="text-[1.375rem] font-semibold tracking-tight text-black sm:text-2xl md:text-[1.65rem]"
        >
          Vanliga frågor
        </h2>
        <dl className="mt-8 space-y-6 md:space-y-7">
          {faqs.map(({ q, a }) => (
            <div
              key={q}
              className="border-b border-gray-100 pb-6 last:border-0 md:pb-7"
            >
              <dt className="text-[15px] font-semibold text-black sm:text-base">
                {q}
              </dt>
              <dd className="mt-1.5 text-[13px] leading-relaxed text-gray-600 sm:text-sm">
                {a}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <footer
      id="kontakt"
      className="border-t border-gray-100 bg-neutral-50/70 py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <h2 className="text-[1.375rem] font-semibold tracking-tight text-black sm:text-2xl md:text-[1.65rem]">
          Kontakt
        </h2>
        <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-gray-600 sm:text-sm">
          Vill du prata om ditt projekt innan du laddar upp? Skriv en rad — jag
          återkommer personligt.
        </p>
        <p className="mt-4">
          <a
            href="mailto:studio@mastrad.se"
            className="text-[13px] font-medium text-black underline decoration-gray-300 underline-offset-[3px] transition-colors hover:decoration-black sm:text-sm"
          >
            studio@mastrad.se
          </a>
        </p>
        <p className="mt-8 text-[11px] text-gray-400 sm:text-xs">
          © {new Date().getFullYear()} MASTRAD. Manuell mastering.
        </p>
        <p className="mt-4 text-[11px] leading-relaxed text-gray-400/70 sm:text-xs">
          Design & utveckling av{" "}
          <a
            href="https://lunov.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500/90 underline decoration-gray-300/60 underline-offset-[3px] transition-colors hover:text-gray-800 hover:decoration-gray-500/80"
          >
            Lunov
          </a>
        </p>
      </div>
    </footer>
  );
}
