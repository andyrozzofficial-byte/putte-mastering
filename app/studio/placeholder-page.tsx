type PlaceholderPageProps = {
  title: string;
  description?: string;
};

export function PlaceholderPage({
  title,
  description = "Nothing here yet.",
}: PlaceholderPageProps) {
  return (
    <main className="flex-1 px-4 pb-10 pt-7 md:px-7 md:pb-14 md:pt-10 lg:px-10 lg:pt-12">
      <div className="mx-auto max-w-2xl space-y-4">
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
