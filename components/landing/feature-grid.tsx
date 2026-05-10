import {
  IconClock,
  IconLock,
  IconShieldCheck,
  IconWaveformFeature,
} from "./feature-icons";

const items = [
  {
    icon: IconWaveformFeature,
    title: "100% Manuell mastering",
    body: "Ingen AI. Bara erfarenhet, öron och känsla.",
  },
  {
    icon: IconShieldCheck,
    title: "Högsta kvalitet",
    body: "Branschstandard för professionella resultat.",
  },
  {
    icon: IconClock,
    title: "Snabb leverans",
    body: "Vanligtvis 2–3 arbetsdagar. Express vid behov.",
  },
  {
    icon: IconLock,
    title: "Säkert & privat",
    body: "Dina filer behandlas alltid konfidentiellt.",
  },
] as const;

export function FeatureGrid() {
  return (
    <section
      id="funktioner"
      className="border-t border-gray-100 bg-neutral-50/70 py-20 md:py-28"
      aria-labelledby="funktioner-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <h2 id="funktioner-heading" className="sr-only">
          Varför välja oss
        </h2>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="space-y-4">
              <Icon className="text-gray-700" />
              <h3 className="text-base font-semibold tracking-tight text-black">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
