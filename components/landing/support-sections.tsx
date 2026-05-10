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
      className="border-t border-gray-100 bg-white py-20 md:py-28"
      aria-labelledby="hur-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="max-w-2xl space-y-3">
          <h2
            id="hur-heading"
            className="text-2xl font-semibold tracking-tight text-black md:text-3xl"
          >
            Så fungerar det
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 md:text-base">
            En rak process utan automatiska kedjor — bara lyssning, omdöme och
            hantverk.
          </p>
        </div>
        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map(({ step, title, text }) => (
            <li key={step} className="space-y-3">
              <span className="text-xs font-semibold tabular-nums text-gray-400">
                {step}
              </span>
              <h3 className="text-lg font-semibold text-black">{title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{text}</p>
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
      className="border-t border-gray-100 bg-neutral-50/80 py-20 md:py-24"
      aria-labelledby="priser-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <h2
          id="priser-heading"
          className="text-2xl font-semibold tracking-tight text-black md:text-3xl"
        >
          Priser
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 md:text-base">
          Offert baseras på antal spår, längd och önskade leveranser. Inga dolda
          avgifter — du får ett tydligt besked innan vi startar.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Standard Master</p>
            <p className="mt-2 text-sm text-gray-600">
              En låt, stereo-master, testlyssning ingår.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Premium Master</p>
            <p className="mt-2 text-sm text-gray-600">
              EP/album, revisionspass och prioriterad kö vid behov.
            </p>
          </div>
        </div>
        <p className="mt-8 text-sm text-gray-500">
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
      className="border-t border-gray-100 bg-white py-20 md:py-24"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl px-6 lg:px-12">
        <h2
          id="faq-heading"
          className="text-2xl font-semibold tracking-tight text-black md:text-3xl"
        >
          Vanliga frågor
        </h2>
        <dl className="mt-10 space-y-8">
          {faqs.map(({ q, a }) => (
            <div key={q} className="border-b border-gray-100 pb-8 last:border-0">
              <dt className="text-base font-semibold text-black">{q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-gray-600">{a}</dd>
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
      className="border-t border-gray-100 bg-neutral-50/70 py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <h2 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">
          Kontakt
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-600">
          Vill du prata om ditt projekt innan du laddar upp? Skriv en rad — jag
          återkommer personligt.
        </p>
        <p className="mt-6">
          <a
            href="mailto:studio@mastrad.se"
            className="text-sm font-medium text-black underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-black"
          >
            studio@mastrad.se
          </a>
        </p>
        <p className="mt-12 text-xs text-gray-400">
          © {new Date().getFullYear()} MASTRAD. Manuell mastering.
        </p>
      </div>
    </footer>
  );
}
