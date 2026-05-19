type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: SectionHeaderProps) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </p>
      <h2 className="text-xl font-semibold text-foreground sm:text-2xl md:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}
