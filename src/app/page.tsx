import Link from "next/link";

import DashboardCharts from "@/components/charts/HomeDashboardChartsWrapper";

const features = [
  {
    title: "Goal Management",
    description: "Create, assign, and align goals across teams with clear ownership.",
  },
  {
    title: "Approval Workflow",
    description: "Route goals for manager review and capture approvals in minutes.",
  },
  {
    title: "Quarterly Tracking",
    description: "Track outcomes by quarter with milestones, health, and blockers.",
  },
  {
    title: "Real-Time Dashboards",
    description: "Monitor performance trends with live progress and health signals.",
  },
  {
    title: "Reporting & Export",
    description: "Generate board-ready reports with shareable, exportable views.",
  },
  {
    title: "Audit Tracking",
    description: "Maintain compliance with a clear audit trail for every change.",
  },
];

const workflowSteps = [
  "Employee Creates Goal",
  "Manager Reviews Goal",
  "Goal Approved",
  "Quarterly Updates",
  "Performance Tracking",
  "Admin Reporting",
];

const roles = [
  {
    title: "Employee",
    items: [
      "Create and update personal goals",
      "Track quarterly progress",
      "Request feedback and alignment",
    ],
  },
  {
    title: "Manager",
    items: [
      "Review and approve goals",
      "Monitor team performance",
      "Coach with real-time insights",
    ],
  },
  {
    title: "Admin/HR",
    items: [
      "Manage templates and policies",
      "Audit goal history and approvals",
      "Export reports and analytics",
    ],
  },
];

const stats = [
  { value: "90%", label: "Faster Goal Approvals" },
  { value: "100%", label: "Centralized Tracking" },
  { value: "24/7", label: "Performance Visibility" },
  { value: "4X", label: "Structured Quarterly Reviews" },
];

export default function Home() {
  return (
    <div className="site">
      <header className="navbar" id="home">
        <div className="container nav-inner">
          <div className="brand">
            <span className="logo-badge">AG</span>
            <span className="brand-name">AtomicGoals</span>
          </div>
          <nav className="nav-links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="#about">About</a>
          </nav>
          <div className="nav-actions">
            <Link className="button small ghost" href="/dashboard">
              Dashboard
            </Link>
            <Link className="button small" href="/login">
              Login
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">GoalTrack Portal</p>
              <h1>Modern Goal Tracking for High-Performance Teams</h1>
              <p className="hero-subtitle">
                Empower employees to create goals, managers to approve them, and
                leadership to track quarterly progress in one centralized
                performance platform.
              </p>
              <div className="cta-row">
                <a className="button" href="#features">
                  Get Started
                </a>
                <a className="button ghost" href="#dashboard">
                  View Demo
                </a>
              </div>
              <div className="hero-badges">
                <div>
                  <span className="badge-label">Approval SLA</span>
                  <strong>48 hrs</strong>
                </div>
                <div>
                  <span className="badge-label">Goals On Track</span>
                  <strong>78%</strong>
                </div>
                <div>
                  <span className="badge-label">Teams Active</span>
                  <strong>24</strong>
                </div>
              </div>
            </div>

            <div className="hero-preview">
              <div className="dashboard-card">
                <div className="dashboard-header">
                  <div>
                    <p className="label">Quarterly Overview</p>
                    <h3>Performance Snapshot</h3>
                  </div>
                  <span className="status-pill">Live</span>
                </div>
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <p>Goals Completed</p>
                    <strong>1,284</strong>
                  </div>
                  <div className="kpi-card">
                    <p>Approvals</p>
                    <strong>94%</strong>
                  </div>
                  <div className="kpi-card">
                    <p>At-Risk</p>
                    <strong>12%</strong>
                  </div>
                </div>
                <div className="progress-list">
                  <div>
                    <div className="progress-label">
                      <span>Engineering</span>
                      <span>82%</span>
                    </div>
                    <div className="progress-bar">
                      <div style={{ width: "82%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="progress-label">
                      <span>Sales</span>
                      <span>71%</span>
                    </div>
                    <div className="progress-bar">
                      <div style={{ width: "71%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="progress-label">
                      <span>Product</span>
                      <span>88%</span>
                    </div>
                    <div className="progress-bar">
                      <div style={{ width: "88%" }} />
                    </div>
                  </div>
                </div>
                <div className="approval-grid">
                  <div>
                    <p>Pending Reviews</p>
                    <strong>34</strong>
                  </div>
                  <div>
                    <p>Avg. Time to Approve</p>
                    <strong>1.6 days</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="features">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Features</p>
              <h2>Everything you need to run goal cycles</h2>
              <p className="section-subtitle">
                Streamline approvals, align priorities, and deliver real-time
                performance visibility across the organization.
              </p>
            </div>
            <div className="feature-grid">
              {features.map((feature) => (
                <div className="feature-card" key={feature.title}>
                  <div className="feature-icon" aria-hidden>
                    <span />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section workflow" id="workflow">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Workflow</p>
              <h2>Aligned, transparent, and fast</h2>
            </div>
            <div className="workflow-steps">
              {workflowSteps.map((step, index) => (
                <div className="workflow-step" key={step}>
                  <span className="step-index">0{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="about">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Role-Based Access</p>
              <h2>Purpose-built for every role</h2>
            </div>
            <div className="role-grid">
              {roles.map((role) => (
                <div className="role-card" key={role.title}>
                  <h3>{role.title}</h3>
                  <ul>
                    {role.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section stats">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Impact</p>
              <h2>Measurable results in every review cycle</h2>
            </div>
            <div className="stats-grid">
              {stats.map((stat) => (
                <div className="metric-card" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="dashboard">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Dashboard Preview</p>
              <h2>See goals, approvals, and performance at a glance</h2>
              <p className="section-subtitle">
                Realistic demo data shows how AtomicGoals keeps every
                stakeholder informed.
              </p>
            </div>
            <DashboardCharts />
            <div className="data-table">
              <div className="table-row table-header">
                <span>Department</span>
                <span>Goals On Track</span>
                <span>Approvals</span>
                <span>Completion</span>
              </div>
              <div className="table-row">
                <span>Engineering</span>
                <span>82%</span>
                <span>96%</span>
                <span>Q2 78%</span>
              </div>
              <div className="table-row">
                <span>Sales</span>
                <span>71%</span>
                <span>91%</span>
                <span>Q2 69%</span>
              </div>
              <div className="table-row">
                <span>Marketing</span>
                <span>76%</span>
                <span>93%</span>
                <span>Q2 74%</span>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-banner">
          <div className="container cta-content">
            <div>
              <p className="eyebrow">Ready to launch</p>
              <h2>Start Managing Goals Smarter</h2>
              <p>
                Bring clarity to performance cycles with a modern platform
                designed for speed, accountability, and measurable outcomes.
              </p>
            </div>
            <div className="cta-row">
              <Link className="button" href="/login">
                Login
              </Link>
              <a className="button ghost" href="#home">
                Request Demo
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
