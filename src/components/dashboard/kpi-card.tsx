import { Card, CardContent } from "@/components/ui/card";

type KpiCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  tone: "up" | "down";
};

export default function KpiCard({
  icon,
  label,
  value,
  trend,
  tone,
}: KpiCardProps) {
  return (
    <Card className="border border-border bg-card shadow-soft">
      <CardContent className="flex items-center gap-2.5 sm:gap-4 p-3 sm:p-5">
        <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5">
            <p className="text-lg sm:text-2xl font-semibold text-foreground leading-none">{value}</p>
            <span
              className={
                tone === "up"
                  ? "text-[10px] sm:text-xs font-semibold text-emerald-600 truncate"
                  : "text-[10px] sm:text-xs font-semibold text-amber-600 truncate"
              }
            >
              {trend}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
