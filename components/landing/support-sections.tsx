function IconStepUpload({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="m8 11 4 4 4-4" />
      <path d="M4 21h16" />
    </svg>
  );
}

function IconStepMix({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 10h3v10H4zM10.5 6h3v14h-3zM17 14h3v6h-3z" />
    </svg>
  );
}

function IconStepDelivery({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 15V3" />
      <path d="m8 11 4 4 4-4" />
      <path d="M4 19h16" />
    </svg>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Upload",
      text: "Send WAV, AIFF or FLAC — keep headroom so we can work with dynamics.",
      icon: IconStepUpload,
    },
    {
      step: "02",
      title: "Manual mastering",
      text: "Listening in a treated room — level, tone and punch refined by hand.",
      icon: IconStepMix,
    },
    {
      step: "03",
      title: "Delivery",
      text: "Master files ready for streaming and download, with clear feedback.",
      icon: IconStepDelivery,
    },
  ];

  return (
    <section
      id="how"
      className="border-t border-gray-100/90 bg-white py-16 md:py-24"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="max-w-2xl space-y-3">
          <h2
            id="how-heading"
            className="text-[1.375rem] font-semibold tracking-tight text-black sm:text-2xl md:text-[1.65rem]"
          >
            A simple process. Professional result.
          </h2>
          <p className="text-[13px] leading-relaxed text-gray-600 sm:text-sm">
            Strong first impressions, emotional impact and translation that holds
            up where it matters — not cheap online processing.
          </p>
        </div>

        <div className="mt-14 md:mt-16">
          <ol className="grid gap-12 md:grid-cols-3 md:gap-8 lg:gap-10">
            {steps.map(({ step, title, text, icon: Icon }, i) => (
              <li
                key={step}
                className={`relative pl-0 md:border-l md:border-gray-100 md:pl-8 lg:pl-10 ${
                  i === 0 ? "md:border-l-0 md:pl-0" : ""
                }`}
              >
                <div className="flex flex-col items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <Icon />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold tabular-nums text-gray-400">
                      {step}
                    </span>
                    <h3 className="text-[15px] font-semibold text-black sm:text-base">
                      {title}
                    </h3>
                    <p className="text-[13px] leading-relaxed text-gray-600 sm:text-sm">
                      {text}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function PricingTeaserSection() {
  const bullets = ["WAV + MP3", "Revisions included", "Manual mastering"] as const;

  return (
    <section
      id="pricing"
      className="border-t border-gray-100/90 bg-neutral-50/40 py-16 md:py-24"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <h2
          id="pricing-heading"
          className="text-[1.375rem] font-semibold tracking-tight text-black sm:text-2xl md:text-[1.65rem]"
        >
          Pricing
        </h2>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-gray-600 sm:text-sm">
          Clear tiers — no hidden fees. You get a straightforward quote before we
          start.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6 lg:max-w-4xl">
          <article className="flex flex-col rounded-2xl border border-gray-200/90 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:p-8">
            <p className="text-[13px] font-medium text-gray-500 sm:text-sm">
              Standard
            </p>
            <p className="mt-2 text-[2rem] font-semibold tracking-tight text-black sm:text-[2.25rem]">
              $60
            </p>
            <p className="mt-1 text-[13px] text-gray-600 sm:text-sm">
              3 business days
            </p>
            <ul className="mt-8 flex flex-col gap-2.5 text-[13px] text-gray-600 sm:text-sm">
              {bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                  {b}
                </li>
              ))}
            </ul>
          </article>

          <article className="flex flex-col rounded-2xl border border-gray-900/10 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/5 md:p-8">
            <p className="text-[13px] font-medium text-gray-500 sm:text-sm">
              Express
            </p>
            <p className="mt-2 text-[2rem] font-semibold tracking-tight text-black sm:text-[2.25rem]">
              $80
            </p>
            <p className="mt-1 text-[13px] text-gray-600 sm:text-sm">
              24 hour delivery
            </p>
            <ul className="mt-8 flex flex-col gap-2.5 text-[13px] text-gray-600 sm:text-sm">
              {bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                  {b}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <p className="mt-10 text-[13px] text-gray-500 sm:text-sm">
          Need a custom quote for an EP or album?{" "}
          <a href="#contact" className="font-medium text-black underline decoration-gray-300 underline-offset-4 hover:decoration-black">
            Get in touch
          </a>
          .
        </p>
      </div>
    </section>
  );
}

export function FaqSection() {
  const faqs = [
    {
      q: "Which file formats should I send?",
      a: "Prefer 24-bit WAV or AIFF without a limiter on the master bus. Higher resolution gives more room to shape final level and clarity.",
    },
    {
      q: "How long is turnaround?",
      a: "Typically 2–3 business days. Tight deadline? Express delivery is available.",
    },
    {
      q: "Can I request changes after the first master?",
      a: "Yes. We work until you are happy within reasonable revision limits.",
    },
  ];

  return (
    <section
      id="faq"
      className="border-t border-gray-100/90 bg-white py-16 md:py-24"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-10">
        <h2
          id="faq-heading"
          className="text-[1.375rem] font-semibold tracking-tight text-black sm:text-2xl md:text-[1.65rem]"
        >
          FAQ
        </h2>
        <dl className="mt-10 space-y-8 md:space-y-10">
          {faqs.map(({ q, a }) => (
            <div
              key={q}
              className="border-b border-gray-100 pb-8 last:border-0 md:pb-10"
            >
              <dt className="text-[15px] font-semibold text-black sm:text-base">
                {q}
              </dt>
              <dd className="mt-2 text-[13px] leading-relaxed text-gray-600 sm:text-sm">
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
      id="contact"
      className="border-t border-gray-100/90 bg-neutral-50/50 py-14 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <h2 className="text-[1.375rem] font-semibold tracking-tight text-black sm:text-2xl md:text-[1.65rem]">
          Contact
        </h2>
        <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-gray-600 sm:text-sm">
          Want to talk through your project before uploading? Send a note — you will
          hear back directly from the engineer.
        </p>
        <p className="mt-5">
          <a
            href="mailto:studio@mastrad.se"
            className="text-[13px] font-medium text-black underline decoration-gray-300 underline-offset-[3px] transition-colors hover:decoration-black sm:text-sm"
          >
            studio@mastrad.se
          </a>
        </p>
        <p className="mt-10 text-[11px] text-gray-400 sm:text-xs">
          © {new Date().getFullYear()} FIRST LISTEN MASTERING. Manual mastering.
        </p>
        <p className="mt-4 text-[11px] leading-relaxed text-gray-400/70 sm:text-xs">
          Design &amp; development by{" "}
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
