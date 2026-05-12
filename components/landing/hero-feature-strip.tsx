import {
  IconClock,
  IconLock,
  IconShieldCheck,
  IconWaveformFeature,
} from "./feature-icons";

const items = [
  {
    icon: IconWaveformFeature,
    title: "100% manual",
    subtitle: "No AI. Ever.",
  },
  {
    icon: IconShieldCheck,
    title: "Highest quality",
    subtitle: "Industry standard",
  },
  {
    icon: IconClock,
    title: "Fast delivery",
    subtitle: "2–3 business days",
  },
  {
    icon: IconLock,
    title: "Secure & private",
    subtitle: "Your files are safe",
  },
] as const;

/** Full-width trust strip directly under the hero (reference order). */
export function HeroFeatureStrip() {
  return (
    <section
      className="border-b border-neutral-200/70 bg-white py-9 sm:py-10 md:py-11"
      aria-label="Studio standards"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-2 sm:gap-x-10 md:grid-cols-4 md:gap-x-8 lg:gap-x-10">
          {items.map(({ icon: Icon, title, subtitle }) => (
            <div key={title} className="flex gap-3.5 md:gap-4">
              <Icon className="mt-0.5 shrink-0 text-neutral-700" />
              <div className="min-w-0 space-y-0.5">
                <p className="text-[12px] font-semibold leading-snug tracking-tight text-black sm:text-[13px]">
                  {title}
                </p>
                <p className="text-[11px] leading-snug text-gray-500 sm:text-xs">
                  {subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
