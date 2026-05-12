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
      className="bg-white py-8 sm:py-9 md:py-10"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h2
            id="how-heading"
            className="text-[1.5rem] font-bold leading-[1.06] tracking-[-0.038em] text-black sm:text-[1.95rem] md:text-[2.2rem]"
          >
            A simple process. Professional result.
          </h2>
          <p className="text-[13px] leading-[1.65] text-gray-600 sm:text-[15px] sm:leading-relaxed">
            Strong first impressions, emotional impact and translation that holds
            up where it matters — not cheap online processing.
          </p>
        </div>

        <div className="mt-9 md:mt-11">
          <ol className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3 md:gap-0">
            {steps.map(({ step, title, text, icon: Icon }, i) => (
              <li key={step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center gap-6 md:gap-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200/80 md:h-[4.25rem] md:w-[4.25rem]">
                      <Icon />
                    </div>
                    {i < steps.length - 1 ? (
                      <div
                        className="hidden h-px w-24 bg-neutral-200/95 md:block lg:w-28"
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <div className="mt-5 max-w-[16rem] space-y-2">
                    <span className="text-[11px] font-semibold tabular-nums tracking-[0.12em] text-gray-400">
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
      className="bg-neutral-50/50 py-8 sm:py-9 md:py-10"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <h2
          id="pricing-heading"
          className="text-[1.5rem] font-bold leading-[1.06] tracking-[-0.038em] text-black sm:text-[1.95rem] md:text-[2.2rem]"
        >
          Pricing
        </h2>
        <p className="mt-3 max-w-2xl text-[13px] leading-[1.65] text-gray-600 sm:mt-4 sm:text-[15px] sm:leading-relaxed">
          Clear tiers — no hidden fees. You get a straightforward quote before we
          start.
        </p>

        <div className="mt-8 grid gap-6 md:mt-9 md:grid-cols-2 md:gap-7 lg:gap-8">
          <article className="flex min-h-[380px] flex-col rounded-2xl bg-white p-10 shadow-[0_14px_60px_-30px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.04] sm:min-h-[400px] sm:p-12 md:p-13">
            <div className="text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
                Standard
              </p>
              <p className="mt-6 text-[2.35rem] font-semibold leading-none tracking-[-0.04em] text-black sm:text-[2.65rem]">
                $60
              </p>
              <p className="mt-3 text-[13px] leading-snug text-gray-600 sm:text-sm">
                3 business days
              </p>
            </div>
            <ul className="mt-auto flex flex-col gap-3 border-t border-neutral-100/90 pt-9 text-left text-[13px] leading-snug text-gray-600 sm:text-sm">
              {bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                  <span className="pt-0.5">{b}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="flex min-h-[380px] flex-col rounded-2xl bg-white p-10 shadow-[0_18px_72px_-34px_rgba(0,0,0,0.26)] ring-1 ring-black/[0.06] sm:min-h-[400px] sm:p-12 md:p-13">
            <div className="text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
                Express
              </p>
              <p className="mt-6 text-[2.35rem] font-semibold leading-none tracking-[-0.04em] text-black sm:text-[2.65rem]">
                $80
              </p>
              <p className="mt-3 text-[13px] leading-snug text-gray-600 sm:text-sm">
                24 hour delivery
              </p>
            </div>
            <ul className="mt-auto flex flex-col gap-3 border-t border-neutral-100/90 pt-9 text-left text-[13px] leading-snug text-gray-600 sm:text-sm">
              {bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                  <span className="pt-0.5">{b}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <p className="mt-10 text-[13px] leading-relaxed text-gray-500 sm:mt-11 sm:text-sm">
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
      className="bg-white py-9 sm:py-10 md:py-12"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl">
          <h2
            id="faq-heading"
            className="text-center text-[1.5rem] font-semibold leading-[1.12] tracking-[-0.03em] text-black sm:text-[1.75rem] md:text-[1.9375rem]"
          >
            FAQ
          </h2>
          <dl className="mt-10 space-y-9 text-left sm:mt-11 sm:space-y-10">
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
      className="bg-neutral-50/50 py-10 sm:py-11 md:py-12"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white px-8 py-10 shadow-[0_18px_72px_-34px_rgba(0,0,0,0.26)] ring-1 ring-black/[0.04] sm:px-10 sm:py-11 md:px-12 md:py-12">
          <h2 className="text-center text-[1.5rem] font-semibold leading-[1.12] tracking-[-0.03em] text-black sm:text-[1.75rem] md:text-[1.9375rem]">
            Contact
          </h2>
          <p className="mt-4 text-center text-[13px] leading-[1.65] text-gray-600 sm:mt-5 sm:text-[15px] sm:leading-relaxed">
            Want to talk through your project before uploading? Send a note — you
            will hear back directly from the engineer.
          </p>
          <p className="mt-6 text-center sm:mt-7">
            <a
              href="mailto:studio@mastrad.se"
              className="text-[13px] font-medium text-black underline decoration-neutral-300 underline-offset-[5px] transition-colors hover:decoration-black sm:text-sm"
            >
              studio@mastrad.se
            </a>
          </p>
        </div>
        <div className="mx-auto mt-7 max-w-2xl text-center sm:mt-8">
          <p className="text-[11px] text-gray-400 sm:text-xs">
            © {new Date().getFullYear()} FIRST LISTEN MASTERING. Manual mastering.
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-gray-400/80 sm:text-xs">
            Design &amp; development by{" "}
            <a
              href="https://lunov.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500/90 underline decoration-neutral-300/70 underline-offset-[3px] transition-colors hover:text-gray-800 hover:decoration-gray-500/80"
            >
              Lunov
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
