import {
  STUDIO_CONTACT_EMAIL,
  STUDIO_CONTACT_MAILTO,
} from "@/lib/brand/contact";

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
      className="bg-neutral-50/55 py-7 sm:py-8 md:py-9"
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

        <div className="mt-7 grid gap-6 md:mt-8 md:grid-cols-2 md:gap-7 lg:gap-8">
          <article className="flex min-h-[410px] flex-col rounded-2xl bg-white p-11 shadow-[0_18px_72px_-36px_rgba(0,0,0,0.26)] ring-1 ring-black/[0.05] transition-shadow duration-300 hover:shadow-[0_22px_90px_-44px_rgba(0,0,0,0.32)] sm:min-h-[430px] sm:p-13 md:p-14">
            <div className="text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
                Standard Master
              </p>
              <p className="mt-6 text-[2.35rem] font-semibold leading-none tracking-[-0.04em] text-black sm:text-[2.65rem]">
                $60
              </p>
              <p className="mt-3 text-[13px] leading-snug text-gray-600 sm:text-sm">
                3 business days
              </p>
            </div>
            <ul className="mt-auto flex flex-col gap-3 border-t border-neutral-100/90 pt-10 text-left text-[13px] leading-snug text-gray-600 sm:text-sm">
              {bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                  <span className="pt-0.5">{b}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="flex min-h-[410px] flex-col rounded-2xl bg-white p-11 shadow-[0_22px_88px_-42px_rgba(0,0,0,0.3)] ring-1 ring-black/[0.07] transition-shadow duration-300 hover:shadow-[0_26px_110px_-54px_rgba(0,0,0,0.36)] sm:min-h-[430px] sm:p-13 md:p-14">
            <div className="text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
                Express Master
              </p>
              <p className="mt-6 text-[2.35rem] font-semibold leading-none tracking-[-0.04em] text-black sm:text-[2.65rem]">
                $80
              </p>
              <p className="mt-3 text-[13px] leading-snug text-gray-600 sm:text-sm">
                24 hour delivery
              </p>
            </div>
            <ul className="mt-auto flex flex-col gap-3 border-t border-neutral-100/90 pt-10 text-left text-[13px] leading-snug text-gray-600 sm:text-sm">
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
          <a
            href={STUDIO_CONTACT_MAILTO}
            className="font-medium text-black/80 underline decoration-black/20 underline-offset-[4px] transition-colors hover:text-black hover:decoration-black/45"
          >
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
      className="bg-white py-8 sm:py-9 md:py-10"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl">
          <h2
            id="faq-heading"
            className="text-center text-[1.65rem] font-bold leading-[1.08] tracking-[-0.04em] text-black sm:text-[1.95rem] md:text-[2.15rem]"
          >
            FAQ
          </h2>
          <dl className="mt-9 space-y-8 text-left sm:mt-10 sm:space-y-9">
            {faqs.map(({ q, a }) => (
              <div
                key={q}
                className="border-b border-neutral-100 pb-10 last:border-0 last:pb-0 md:pb-12"
              >
                <dt className="text-[15px] font-semibold leading-snug tracking-[-0.02em] text-black sm:text-base md:text-[18px]">
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
      className="border-t border-black/[0.06] bg-[#fafafa] py-14 sm:py-16 md:py-20"
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-black/38 sm:text-[11px] sm:tracking-[0.44em]">
            Studio
          </p>
          <h2 className="mt-4 text-[1.4rem] font-normal leading-[1.2] tracking-[-0.025em] text-black/[0.92] sm:text-2xl md:text-[1.8rem]">
            Get in touch
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[13px] leading-[1.7] text-black/44 sm:text-sm sm:leading-[1.75]">
            Questions before you upload, custom quotes for EPs and albums, or
            revision notes — write directly to the studio. You will hear back from
            the engineer.
          </p>

          <div className="mt-10 sm:mt-11">
            <a
              href={STUDIO_CONTACT_MAILTO}
              className="inline-block font-mono text-[13px] tracking-[0.02em] text-black/72 transition-colors hover:text-black sm:text-sm"
            >
              {STUDIO_CONTACT_EMAIL}
            </a>
          </div>

          <div
            className="mx-auto mt-10 h-px w-14 bg-gradient-to-r from-transparent via-black/12 to-transparent sm:mt-11"
            aria-hidden
          />
        </div>

        <div className="mx-auto mt-12 max-w-2xl space-y-3 text-center sm:mt-14">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/32 sm:text-[11px]">
            First Listen Mastering
          </p>
          <p className="text-[11px] leading-relaxed text-black/34 sm:text-xs">
            © {new Date().getFullYear()} First Listen Mastering. Manual mastering.
          </p>
          <p className="text-[10px] leading-relaxed text-black/28 sm:text-[11px]">
            Site by{" "}
            <a
              href="https://lunov.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black/40 underline decoration-black/15 underline-offset-[3px] transition-colors hover:text-black/60 hover:decoration-black/30"
            >
              Lunov
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
