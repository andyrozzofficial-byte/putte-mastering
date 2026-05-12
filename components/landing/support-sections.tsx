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
      className="border-t border-neutral-200/85 bg-white py-20 sm:py-24 md:py-28"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="max-w-2xl space-y-4">
          <h2
            id="how-heading"
            className="text-[1.5rem] font-semibold leading-[1.15] tracking-[-0.028em] text-black sm:text-[1.6875rem] md:text-[1.9375rem]"
          >
            A simple process. Professional result.
          </h2>
          <p className="text-[13px] leading-[1.65] text-gray-600 sm:text-[15px] sm:leading-relaxed">
            Strong first impressions, emotional impact and translation that holds
            up where it matters — not cheap online processing.
          </p>
        </div>

        <div className="mt-16 md:mt-20">
          <ol className="grid gap-14 md:grid-cols-3 md:gap-10 lg:gap-12">
            {steps.map(({ step, title, text, icon: Icon }, i) => (
              <li
                key={step}
                className={`relative pl-0 md:border-l md:border-neutral-200/90 md:pl-9 lg:pl-11 ${
                  i === 0 ? "md:border-l-0 md:pl-0" : ""
                }`}
              >
                <div className="flex flex-col items-start gap-5">
                  <div className="flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full border border-neutral-200/90 bg-white text-gray-900 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.06)]">
                    <Icon />
                  </div>
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-semibold tabular-nums tracking-wide text-gray-400">
                      {step}
                    </span>
                    <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base md:text-[17px]">
                      {title}
                    </h3>
                    <p className="text-[13px] leading-[1.65] text-gray-600 sm:text-sm">
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
      className="border-t border-neutral-200/85 bg-neutral-50/55 py-20 sm:py-24 md:py-28"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <h2
          id="pricing-heading"
          className="text-[1.5rem] font-semibold leading-[1.15] tracking-[-0.028em] text-black sm:text-[1.6875rem] md:text-[1.9375rem]"
        >
          Pricing
        </h2>
        <p className="mt-4 max-w-2xl text-[13px] leading-[1.65] text-gray-600 sm:text-[15px] sm:leading-relaxed">
          Clear tiers — no hidden fees. You get a straightforward quote before we
          start.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8 lg:max-w-4xl">
          <article className="flex min-h-[300px] flex-col rounded-[1.125rem] border border-neutral-200/90 bg-white p-8 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.06)] sm:p-9 md:min-h-[320px] md:p-10">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                Standard
              </p>
              <p className="mt-4 text-[2.25rem] font-semibold leading-none tracking-[-0.03em] text-black sm:text-[2.5rem]">
                $60
              </p>
              <p className="mt-3 text-[13px] leading-snug text-gray-600 sm:text-sm">
                3 business days
              </p>
            </div>
            <ul className="mt-auto flex flex-col gap-3 border-t border-neutral-100 pt-8 text-[13px] leading-snug text-gray-600 sm:text-sm">
              {bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                  <span className="pt-0.5">{b}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="flex min-h-[300px] flex-col rounded-[1.125rem] border border-black/[0.12] bg-white p-8 shadow-[0_2px_14px_-5px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06] sm:p-9 md:min-h-[320px] md:p-10">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                Express
              </p>
              <p className="mt-4 text-[2.25rem] font-semibold leading-none tracking-[-0.03em] text-black sm:text-[2.5rem]">
                $80
              </p>
              <p className="mt-3 text-[13px] leading-snug text-gray-600 sm:text-sm">
                24 hour delivery
              </p>
            </div>
            <ul className="mt-auto flex flex-col gap-3 border-t border-neutral-100 pt-8 text-[13px] leading-snug text-gray-600 sm:text-sm">
              {bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                  <span className="pt-0.5">{b}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <p className="mt-12 text-[13px] leading-relaxed text-gray-500 sm:mt-14 sm:text-sm">
          Need a custom quote for an EP or album?{" "}
          <a href="#contact" className="font-medium text-black underline decoration-neutral-300 underline-offset-[5px] transition-colors hover:decoration-black">
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
      className="border-t border-neutral-200/85 bg-white py-20 sm:py-24 md:py-28"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <h2
            id="faq-heading"
            className="text-[1.5rem] font-semibold leading-[1.15] tracking-[-0.028em] text-black sm:text-[1.6875rem] md:text-[1.9375rem]"
          >
            FAQ
          </h2>
          <dl className="mt-12 space-y-10 md:mt-14 md:space-y-12">
            {faqs.map(({ q, a }) => (
              <div
                key={q}
                className="border-b border-neutral-100 pb-10 last:border-0 last:pb-0 md:pb-12"
              >
                <dt className="text-[15px] font-semibold leading-snug tracking-[-0.015em] text-black sm:text-base md:text-[17px]">
                  {q}
                </dt>
                <dd className="mt-3 text-[13px] leading-[1.65] text-gray-600 sm:text-sm">
                  {a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <footer
      id="contact"
      className="border-t border-neutral-200/85 bg-neutral-50/45 py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <h2 className="text-[1.5rem] font-semibold leading-[1.15] tracking-[-0.028em] text-black sm:text-[1.6875rem] md:text-[1.9375rem]">
          Contact
        </h2>
        <p className="mt-5 max-w-xl text-[13px] leading-[1.65] text-gray-600 sm:text-[15px] sm:leading-relaxed">
          Want to talk through your project before uploading? Send a note — you will
          hear back directly from the engineer.
        </p>
        <p className="mt-5">
          <a
            href="mailto:studio@mastrad.se"
            className="text-[13px] font-medium text-black underline decoration-neutral-300 underline-offset-[4px] transition-colors hover:decoration-black sm:text-sm"
          >
            studio@mastrad.se
          </a>
        </p>
        <p className="mt-12 text-[11px] text-gray-400 sm:mt-14 sm:text-xs">
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
