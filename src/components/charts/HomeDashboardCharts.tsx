"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const progressData = [
  { name: "Eng", value: 82 },
  { name: "Sales", value: 71 },
  { name: "Mkt", value: 76 },
  { name: "Ops", value: 68 },
];

const approvalData = [
  { name: "Approved", value: 72 },
  { name: "Pending", value: 18 },
  { name: "Needs Review", value: 10 },
];
const COLORS = ["#1d4ed8", "#93c5fd", "#e2e8f0"];

const performanceData = [
  { month: "Jan", value: 68 },
  { month: "Feb", value: 71 },
  { month: "Mar", value: 74 },
  { month: "Apr", value: 78 },
  { month: "May", value: 81 },
  { month: "Jun", value: 84 },
];

const quarterlyData = [
  { quarter: "Q1", value: 74 },
  { quarter: "Q2", value: 69 },
  { quarter: "Q3", value: 78 },
  { quarter: "Q4", value: 83 },
];

export default function DashboardCharts() {
  return (
    <div className="chart-grid">
      <div className="chart-card">
        <h3>Employee Progress</h3>
        <div style={{ width: "100%", height: "220px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar dataKey="value" fill="#1d4ed8" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="chart-card">
        <h3>Approval Rate</h3>
        <div style={{ width: "100%", height: "220px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Pie
                data={approvalData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {approvalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 text-xs mt-2" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '12px', marginTop: '8px' }}>
          {approvalData.map((entry, index) => (
            <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></span>
              <span>{entry.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-card">
        <h3>Department Performance</h3>
        <div style={{ width: "100%", height: "220px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis domain={[60, 90]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#1d4ed8" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <h3>Quarterly Completion</h3>
        <div style={{ width: "100%", height: "220px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quarterlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="quarter" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
