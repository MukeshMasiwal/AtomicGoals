export function getQuarterlyWindowInfo() {
  const now = new Date();
  const month = now.getMonth(); // 0 = Jan, 11 = Dec

  // Enforced windows according to enterprise rules:
  // Phase 1 - Goal Setting: May (4)
  // Q1 Check-in: July (6)
  // Q2 Check-in: October (9)
  // Q3 Check-in: January (0)
  // Q4 / Annual: March (2) / April (3)

  let isOpen = false;
  let name = "Closed";
  let lockDate = new Date();

  if (month === 4) {
    isOpen = true;
    name = "Phase 1 - Goal Setting";
    lockDate = new Date(now.getFullYear(), 5, 0); // End of May
  } else if (month === 6) {
    isOpen = true;
    name = "Q1 Check-in";
    lockDate = new Date(now.getFullYear(), 7, 0); // End of July
  } else if (month === 9) {
    isOpen = true;
    name = "Q2 Check-in";
    lockDate = new Date(now.getFullYear(), 10, 0); // End of October
  } else if (month === 0) {
    isOpen = true;
    name = "Q3 Check-in";
    lockDate = new Date(now.getFullYear(), 1, 0); // End of January
  } else if (month === 2 || month === 3) {
    isOpen = true;
    name = "Q4 / Annual";
    lockDate = new Date(now.getFullYear(), 4, 0); // End of April
  }

  return { isOpen, name, lockDate };
}

export function calculateKPIScore(
  type: string,
  target: number | null | undefined,
  actual: number | null | undefined,
  deadline?: Date | null,
  completionDate?: Date | null,
): number {
  if (type !== "timeline" && (target == null || actual == null || Number.isNaN(target) || Number.isNaN(actual))) {
    return 0;
  }

  let score = 0;
  const numActual = Number(actual);
  const numTarget = Number(target);

  if (type === "min") {
    // Higher is Better: actual / target
    if (numTarget === 0) {
      score = numActual >= 0 ? 100 : 0;
    } else {
      score = (numActual / numTarget) * 100;
    }
  } else if (type === "max") {
    // Lower is Better: target / actual
    if (numActual === 0) {
      score = numTarget >= 0 ? 100 : 0;
    } else {
      score = (numTarget / numActual) * 100;
    }
  } else if (type === "timeline") {
    // Timeline Type
    if (deadline && completionDate) {
      const cDate = new Date(completionDate).getTime();
      const dDate = new Date(deadline).getTime();
      if (cDate <= dDate) {
        score = 100;
      } else {
        const daysOverdue = Math.max(0, (cDate - dDate) / (1000 * 60 * 60 * 24));
        score = Math.max(0, 100 - (daysOverdue * 5)); // Reduce score safely by 5 per day overdue
      }
    } else {
      score = 0;
    }
  } else if (type === "zero") {
    // Zero Type (e.g. Incidents)
    score = numActual === 0 ? 100 : 0;
  }

  if (Number.isNaN(score) || !Number.isFinite(score)) {
    return 0;
  }

  return Math.min(Math.max(Math.round(score), 0), 100);
}
