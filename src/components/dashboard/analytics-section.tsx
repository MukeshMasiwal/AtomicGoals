import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DepartmentBarChart from "@/components/charts/department-bar-chart";
import GoalCompletionChart from "@/components/charts/goal-completion-chart";
import QuarterlyLineChart from "@/components/charts/quarterly-line-chart";

type AnalyticsSectionProps = {
  quarterlyPerformance: { name: string; value: number }[];
  departmentComparison: { name: string; value: number }[];
  goalCompletion: { name: string; value: number }[];
};

export default function AnalyticsSection({
  quarterlyPerformance,
  departmentComparison,
  goalCompletion,
}: AnalyticsSectionProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="border border-border bg-card shadow-soft lg:col-span-2 min-w-0">
        <CardHeader>
          <CardTitle>Quarterly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <QuarterlyLineChart data={quarterlyPerformance} />
        </CardContent>
      </Card>
      <Card className="border border-border bg-card shadow-soft min-w-0">
        <CardHeader>
          <CardTitle>Goal Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalCompletionChart data={goalCompletion} />
        </CardContent>
      </Card>
      <Card className="border border-border bg-card shadow-soft lg:col-span-3 min-w-0">
        <CardHeader>
          <CardTitle>Department Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentBarChart data={departmentComparison} />
        </CardContent>
      </Card>
    </div>
  );
}
