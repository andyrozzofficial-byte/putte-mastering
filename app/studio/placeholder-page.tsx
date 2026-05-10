type PlaceholderPageProps = {
  title: string;
  description?: string;
};

export function PlaceholderPage({
  title,
  description = "Den här vyn är på gång. Under tiden når du allt viktigt från översikten.",
}: PlaceholderPageProps) {
  return (
    <main className="flex-1 px-4 pb-12 pt-6 md:px-8 md:pb-16 md:pt-10 lg:px-12 lg:pt-12">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-gray-600">{description}</p>
      </div>
    </main>
  );
}
