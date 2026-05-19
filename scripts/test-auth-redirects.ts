import { resolveAuthRedirectPath } from "../src/lib/auth";

type Case = {
  name: string;
  input: any;
  expected: string;
};

const cases: Case[] = [
  {
    name: "Seed user -> dashboard",
    input: { approvalStatus: "Pending Approval", onboardingCompleted: false, verified: true, isSeedUser: true },
    expected: "/dashboard",
  },
  {
    name: "New placeholder (not verified) -> onboarding",
    input: { approvalStatus: "Pending Approval", onboardingCompleted: false, verified: false, isSeedUser: false },
    expected: "/onboarding",
  },
  {
    name: "Existing pending verified -> waiting-approval",
    input: { approvalStatus: "Pending Approval", onboardingCompleted: false, verified: true, isSeedUser: false },
    expected: "/waiting-approval",
  },
  {
    name: "Approved verified -> dashboard",
    input: { approvalStatus: "Approved", onboardingCompleted: true, verified: true, isSeedUser: false },
    expected: "/dashboard",
  },
  {
    name: "Rejected verified -> rejected",
    input: { approvalStatus: "Rejected", onboardingCompleted: true, verified: true, isSeedUser: false },
    expected: "/rejected",
  },
  {
    name: "Legacy caller without flags, onboarding incomplete -> onboarding",
    input: { approvalStatus: "Pending Approval", onboardingCompleted: false },
    expected: "/onboarding",
  },
];

let passed = 0;
for (const c of cases) {
  const out = resolveAuthRedirectPath(c.input as any);
  const ok = out === c.expected;
  console.log(`${ok ? "✔" : "✖"} ${c.name}: got=${out} expected=${c.expected}`);
  if (ok) passed++;
}
console.log(`\n${passed}/${cases.length} tests passed.`);
if (passed !== cases.length) process.exit(1);
