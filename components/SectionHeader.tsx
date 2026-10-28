export function SectionHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-black leading-tight text-brand-navy md:text-5xl">{title}</h2>
      {description ? <p className="mt-5 text-base leading-8 text-muted md:text-lg">{description}</p> : null}
    </div>
  );
}
