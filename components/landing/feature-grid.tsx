import {
  IconClock,
  IconLock,
  IconShieldCheck,
  IconWaveformFeature,
} from "./feature-icons";

const items = [
  {
    icon: IconWaveformFeature,
    title: "100% manual mastering",
    body: "No AI. Just experience, precision and taste.",
  },
  {
    icon: IconShieldCheck,
    title: "Highest quality",
    body: "Industry-standard mastering for professional results.",
  },
  {
    icon: IconClock,
    title: "Fast delivery",
    body: "Usually delivered in 2–3 business days.",
  },
  {
    icon: IconLock,
    title: "Secure & private",
    body: "Your files are always safe and confidential.",
  },
] as const;

export function FeatureGrid() {
  return (
    <section
      id="features"
      className="border-t border-neutral-200/85 bg-white py-20 sm:py-24 md:py-28"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <h2 id="features-heading" className="sr-only">
          Why First Listen
        </h2>
        <div className="grid gap-12 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-12 lg:gap-y-10">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="space-y-4">
              <Icon className="text-gray-800" />
              <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base md:text-[17px]">
                {title}
              </h3>
              <p className="text-[13px] leading-[1.65] text-gray-600 sm:text-sm">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
