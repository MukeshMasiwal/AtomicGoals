"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import type { Role } from "@/lib/mock-data";
import { parseRole } from "@/utils/roles";

export function useRole() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = parseRole(searchParams.get("role"));

  const setRole = useCallback(
    (nextRole: Role) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("role", nextRole);
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams],
  );

  return { role, setRole };
}
