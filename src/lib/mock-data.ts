import type { Role } from "@/types";

export type { Role };

export type GoalStatus = "Draft" | "Pending" | "Approved" | "Rejected";

export type GoalItem = {
  id: string;
  title: string;
  status: GoalStatus;
  weight: string;
  progress: number;
  deadline: string;
  approval: string;
};

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  actor: string;
  initials: string;
  type: "approved" | "edited" | "submitted" | "feedback";
};

export type PendingAction = {
  id: string;
  title: string;
  description: string;
  tone: "blue" | "amber" | "emerald" | "rose";
  cta: string;
  icon: "goals" | "update" | "feedback" | "export" | "audit";
};

export type RolePanel = {
  title: string;
  items: string[];
  emptyState?: string;
};

export type KpiItem = {
  label: string;
  value: number | string;
  trend: string;
  tone: "up" | "down";
};

export type DashboardData = {
  user: { name: string; role: Role; roleLabel: string };
  hero: { headline: string; subtitle: string };
  kpis: KpiItem[];
  progress: number;
  goals: GoalItem[];
  pendingActions: PendingAction[];
  activityFeed: ActivityItem[];
  rolePanels: RolePanel[];
  quickActions: string[];
  chartData: {
    quarterlyPerformance: { name: string; value: number }[];
    departmentComparison: { name: string; value: number }[];
    goalCompletion: { name: string; value: number }[];
  };
};

const employeeGoals: GoalItem[] = [
  {
    id: "g1",
    title: "Launch Q2 onboarding refresh",
    status: "Approved",
    weight: "20%",
    progress: 78,
    deadline: "Jun 20",
    approval: "Approved",
  },
  {
    id: "g2",
    title: "Reduce churn in mid-market segment",
    status: "Pending",
    weight: "30%",
    progress: 46,
    deadline: "Jul 02",
    approval: "Awaiting manager",
  },
  {
    id: "g3",
    title: "Improve cross-team feedback loops",
    status: "Draft",
    weight: "15%",
    progress: 22,
    deadline: "Jun 15",
    approval: "Not submitted",
  },
  {
    id: "g4",
    title: "Deliver Q2 revenue enablement playbook",
    status: "Rejected",
    weight: "10%",
    progress: 10,
    deadline: "May 30",
    approval: "Needs revision",
  },
];

const managerGoals: GoalItem[] = [
  {
    id: "m1",
    title: "Team: Hit Q2 pipeline coverage target",
    status: "Approved",
    weight: "25%",
    progress: 84,
    deadline: "Jun 30",
    approval: "Self-approved",
  },
  {
    id: "m2",
    title: "Approve 4 direct-report goals",
    status: "Pending",
    weight: "—",
    progress: 50,
    deadline: "Jun 18",
    approval: "4 pending",
  },
  {
    id: "m3",
    title: "Complete mid-cycle calibration",
    status: "Draft",
    weight: "15%",
    progress: 35,
    deadline: "Jul 10",
    approval: "Draft",
  },
];

const adminGoals: GoalItem[] = [
  {
    id: "a1",
    title: "Org-wide goal cycle rollout",
    status: "Approved",
    weight: "—",
    progress: 92,
    deadline: "Jun 30",
    approval: "Complete",
  },
  {
    id: "a2",
    title: "Policy compliance audit — Q2",
    status: "Pending",
    weight: "—",
    progress: 68,
    deadline: "Jun 25",
    approval: "In review",
  },
];

const roleConfig: Record<
  Role,
  {
    hero: DashboardData["hero"];
    kpis: KpiItem[];
    progress: number;
    goals: GoalItem[];
    pendingActions: PendingAction[];
    activityFeed: ActivityItem[];
    rolePanels: RolePanel[];
    quickActions: string[];
    chartData: DashboardData["chartData"];
  }
> = {
  employee: {
    hero: {
      headline: "Your goals are trending in the right direction.",
      subtitle:
        "Stay on top of approvals, quarterly progress, and feedback with your personal performance workspace.",
    },
    kpis: [
      { label: "Goals Completed", value: 3, trend: "+1 this month", tone: "up" },
      { label: "Pending Reviews", value: 1, trend: "Due Jun 18", tone: "down" },
      { label: "Quarterly Score", value: "3.8", trend: "+0.3", tone: "up" },
      { label: "Team Progress", value: "78%", trend: "+6%", tone: "up" },
    ],
    progress: 72,
    goals: employeeGoals,
    pendingActions: [
      {
        id: "e1",
        title: "1 Goal Pending Approval",
        description: "Your churn reduction goal is awaiting manager sign-off.",
        tone: "blue",
        cta: "View goal",
        icon: "goals",
      },
      {
        id: "e2",
        title: "Q2 Update Submission Due",
        description: "Submit your quarterly progress update by Friday, Jun 20.",
        tone: "amber",
        cta: "Submit update",
        icon: "update",
      },
      {
        id: "e3",
        title: "Manager Feedback Awaiting",
        description: "Review feedback on your revenue enablement goal.",
        tone: "emerald",
        cta: "Open feedback",
        icon: "feedback",
      },
    ],
    activityFeed: [
      {
        id: "ea1",
        title: "Goal approved",
        description: "Manager approved your Q2 onboarding refresh goal.",
        time: "2h ago",
        actor: "Taylor K.",
        initials: "TK",
        type: "approved",
      },
      {
        id: "ea2",
        title: "Goal edited",
        description: "You updated KPI targets for the churn reduction goal.",
        time: "Yesterday",
        actor: "Mukesh",
        initials: "MU",
        type: "edited",
      },
      {
        id: "ea3",
        title: "Quarterly update submitted",
        description: "Q2 progress update sent for onboarding refresh.",
        time: "2 days ago",
        actor: "Mukesh",
        initials: "MU",
        type: "submitted",
      },
      {
        id: "ea4",
        title: "Manager feedback added",
        description: "Taylor added comments on revenue enablement goal.",
        time: "3 days ago",
        actor: "Taylor K.",
        initials: "TK",
        type: "feedback",
      },
    ],
    rolePanels: [
      {
        title: "Personal Goals",
        items: ["3 goals on track", "1 draft waiting to submit", "1 pending approval"],
      },
      {
        title: "Quarterly Updates",
        items: ["Q2 update 78% complete", "1 update due this week", "Last submitted May 12"],
      },
      {
        title: "Feedback",
        items: ["1 manager comment unread", "2 peer kudos received", "0 pending requests"],
      },
    ],
    quickActions: ["Create Goal", "Submit Update", "View My Goals", "Request Feedback"],
    chartData: {
      quarterlyPerformance: [
        { name: "Jan", value: 62 },
        { name: "Feb", value: 65 },
        { name: "Mar", value: 68 },
        { name: "Apr", value: 70 },
        { name: "May", value: 72 },
        { name: "Jun", value: 78 },
      ],
      departmentComparison: [
        { name: "Your Team", value: 78 },
        { name: "Company Avg", value: 71 },
        { name: "Top Quartile", value: 86 },
      ],
      goalCompletion: [
        { name: "Completed", value: 45 },
        { name: "In Progress", value: 40 },
        { name: "At Risk", value: 15 },
      ],
    },
  },
  manager: {
    hero: {
      headline: "Your team is 87% on track for Q2.",
      subtitle:
        "Review pending approvals, coach direct reports, and keep quarterly momentum visible across your org.",
    },
    kpis: [
      { label: "Goals Completed", value: 24, trend: "+4 this week", tone: "up" },
      { label: "Pending Reviews", value: 6, trend: "2 overdue", tone: "down" },
      { label: "Quarterly Score", value: "4.1", trend: "+0.2", tone: "up" },
      { label: "Team Progress", value: "87%", trend: "+3%", tone: "up" },
    ],
    progress: 87,
    goals: managerGoals,
    pendingActions: [
      {
        id: "m1",
        title: "4 Goals Pending Approval",
        description: "Direct reports submitted goals awaiting your review.",
        tone: "blue",
        cta: "Review queue",
        icon: "goals",
      },
      {
        id: "m2",
        title: "2 Overdue Reviews",
        description: "Mid-cycle reviews past the SLA deadline.",
        tone: "rose",
        cta: "Open reviews",
        icon: "feedback",
      },
      {
        id: "m3",
        title: "Team Q2 Updates Due",
        description: "3 team members have not submitted quarterly updates.",
        tone: "amber",
        cta: "Send reminder",
        icon: "update",
      },
    ],
    activityFeed: [
      {
        id: "ma1",
        title: "Goal approved",
        description: "You approved Jordan's pipeline coverage goal.",
        time: "1h ago",
        actor: "You",
        initials: "MU",
        type: "approved",
      },
      {
        id: "ma2",
        title: "Quarterly update submitted",
        description: "Camila submitted her Q2 progress update.",
        time: "4h ago",
        actor: "Camila R.",
        initials: "CR",
        type: "submitted",
      },
      {
        id: "ma3",
        title: "Goal edited",
        description: "Alex revised weightage on customer success goal.",
        time: "Yesterday",
        actor: "Alex P.",
        initials: "AP",
        type: "edited",
      },
      {
        id: "ma4",
        title: "Manager feedback added",
        description: "You left feedback on Sam's growth experiments goal.",
        time: "2 days ago",
        actor: "You",
        initials: "MU",
        type: "feedback",
      },
    ],
    rolePanels: [
      {
        title: "Pending Approvals",
        items: ["4 goals to approve", "2 goals need edits", "1 overdue review"],
      },
      {
        title: "Team Analytics",
        items: ["87% goals on track", "12% at risk", "Avg score 4.1/5"],
      },
      {
        title: "Review Queue",
        items: ["6 reviews in queue", "2 escalated", "Avg turnaround 1.4 days"],
      },
    ],
    quickActions: [
      "Approve Goals",
      "View Team Progress",
      "Schedule 1:1",
      "Export Team Report",
    ],
    chartData: {
      quarterlyPerformance: [
        { name: "Jan", value: 70 },
        { name: "Feb", value: 74 },
        { name: "Mar", value: 78 },
        { name: "Apr", value: 82 },
        { name: "May", value: 85 },
        { name: "Jun", value: 87 },
      ],
      departmentComparison: [
        { name: "Engineering", value: 82 },
        { name: "Sales", value: 71 },
        { name: "Marketing", value: 76 },
        { name: "Your Team", value: 87 },
      ],
      goalCompletion: [
        { name: "Completed", value: 58 },
        { name: "In Progress", value: 32 },
        { name: "At Risk", value: 10 },
      ],
    },
  },
  admin: {
    hero: {
      headline: "Organization performance is strong this quarter.",
      subtitle:
        "Monitor org-wide metrics, audit activity, and export leadership-ready reports from one command center.",
    },
    kpis: [
      { label: "Goals Completed", value: "1,284", trend: "+12% YoY", tone: "up" },
      { label: "Pending Reviews", value: 34, trend: "-8% vs Q1", tone: "up" },
      { label: "Quarterly Score", value: "3.9", trend: "+0.4", tone: "up" },
      { label: "Team Progress", value: "81%", trend: "+5%", tone: "up" },
    ],
    progress: 81,
    goals: adminGoals,
    pendingActions: [
      {
        id: "a1",
        title: "12 Exports Scheduled",
        description: "Leadership board report exports queued for Friday.",
        tone: "blue",
        cta: "View exports",
        icon: "export",
      },
      {
        id: "a2",
        title: "3 Compliance Flags",
        description: "Goals missing required weightage validation.",
        tone: "rose",
        cta: "Resolve flags",
        icon: "audit",
      },
      {
        id: "a3",
        title: "Q2 Cycle Closes in 14 Days",
        description: "Finalize org-wide quarterly close and audit summaries.",
        tone: "amber",
        cta: "Open calendar",
        icon: "update",
      },
    ],
    activityFeed: [
      {
        id: "aa1",
        title: "Audit log exported",
        description: "HR exported Q2 policy change audit trail.",
        time: "30m ago",
        actor: "HR Ops",
        initials: "HR",
        type: "submitted",
      },
      {
        id: "aa2",
        title: "Goal approved",
        description: "Bulk approval completed for Sales division.",
        time: "3h ago",
        actor: "System",
        initials: "SY",
        type: "approved",
      },
      {
        id: "aa3",
        title: "Quarterly update submitted",
        description: "22 teams submitted Q2 updates this week.",
        time: "Yesterday",
        actor: "Analytics",
        initials: "AN",
        type: "submitted",
      },
      {
        id: "aa4",
        title: "Policy updated",
        description: "Goal weightage validation rules updated.",
        time: "2 days ago",
        actor: "Admin",
        initials: "AD",
        type: "edited",
      },
    ],
    rolePanels: [
      {
        title: "Organization Metrics",
        items: ["1,284 active goals", "94% approvals on time", "22 teams active"],
      },
      {
        title: "Exports & Reports",
        items: ["12 exports this week", "4 scheduled reports", "Board deck ready"],
      },
      {
        title: "Audit Summary",
        items: ["28 policy changes", "0 critical flags", "Full trail available"],
      },
    ],
    quickActions: [
      "Export Report",
      "View Audit Logs",
      "Manage Users",
      "Org Settings",
    ],
    chartData: {
      quarterlyPerformance: [
        { name: "Jan", value: 68 },
        { name: "Feb", value: 72 },
        { name: "Mar", value: 75 },
        { name: "Apr", value: 78 },
        { name: "May", value: 80 },
        { name: "Jun", value: 81 },
      ],
      departmentComparison: [
        { name: "Engineering", value: 82 },
        { name: "Sales", value: 71 },
        { name: "Marketing", value: 76 },
        { name: "People Ops", value: 69 },
        { name: "Finance", value: 74 },
      ],
      goalCompletion: [
        { name: "Completed", value: 64 },
        { name: "In Progress", value: 26 },
        { name: "At Risk", value: 10 },
      ],
    },
  },
};

export function getDashboardData(role: Role, name = "Mukesh"): DashboardData {
  const config = roleConfig[role];
  const roleLabel =
    role === "admin" ? "Admin" : role === "manager" ? "Manager" : "Employee";

  return {
    user: { name, role, roleLabel },
    hero: config.hero,
    kpis: config.kpis,
    progress: config.progress,
    goals: config.goals,
    pendingActions: config.pendingActions,
    activityFeed: config.activityFeed,
    rolePanels: config.rolePanels,
    quickActions: config.quickActions,
    chartData: config.chartData,
  };
}
