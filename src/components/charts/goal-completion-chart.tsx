"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#1d4ed8", "#93c5fd", "#e2e8f0"];

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  fontSize: "12px",
};

type GoalCompletionChartProps = {
  data: { name: string; value: number }[];
};

export default function GoalCompletionChart({
  data,
}: GoalCompletionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={70}
          outerRadius={95}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}
