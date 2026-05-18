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
      <CardContent className="flex items-center gap-4 px-5 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-semibold text-foreground">{value}</p>
            <span
              className={
                tone === "up"
                  ? "text-xs font-semibold text-emerald-600"
                  : "text-xs font-semibold text-amber-600"
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
