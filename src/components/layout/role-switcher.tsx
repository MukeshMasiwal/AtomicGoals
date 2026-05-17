"use client";

import { useRole } from "@/hooks/use-role";
import type { Role } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const options: { value: Role; label: string }[] = [
  { value: "employee", label: "Employee" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

export default function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 md:flex">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setRole(option.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
            role === option.value
              ? "bg-white text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
