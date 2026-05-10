type PlaceholderPageProps = {
  title: string;
  description?: string;
};

export function PlaceholderPage({
  title,
  description = "Den här vyn är på gång. Under tiden når du allt viktigt från översikten.",
}: PlaceholderPageProps) {
  return (
    <main className="flex-1 px-4 pb-10 pt-5 md:px-7 md:pb-14 md:pt-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-2xl space-y-3">
        <h1 className="text-[1.375rem] font-semibold tracking-tight text-black sm:text-2xl md:text-[1.65rem]">
          {title}
        </h1>
        <p className="text-[13px] leading-relaxed text-gray-600 sm:text-sm">
          {description}
        </p>
      </div>
    </main>
  );
}
