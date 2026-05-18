import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";

import * as xlsx from "xlsx";

export async function GET(req: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role === "employee") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";

    await connectDB();

    const goals = await Goal.find()
      .populate("creator", "name department")
      .populate("team", "name")
      .populate("assignedManager", "name")
      .lean();

    const data = goals.map((g: any) => ({
      "Employee Name": g.creator?.name || "",
      "Department": g.creator?.department || g.department || "",
      "Team": g.team?.name || "",
      "Goal Title": g.title,
      "Status": g.status || "not-started",
      "Planned Target (Tasks)": g.numberOfTasks || 1,
      "Actual Achievement": g.actualAchievement || "",
      "Approval Status": g.approvalStatus || "Draft",
      "Quarterly Progress": `${g.progress || 0}%`,
    }));

    if (format === "xlsx") {
      const worksheet = xlsx.utils.json_to_sheet(data);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Goals");
      const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="quarterly_checkin.xlsx"',
        },
      });
    } else {
      // CSV Export
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          headers.map((h) => `"${String((row as any)[h]).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="quarterly_checkin.csv"',
        },
      });
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 },
    );
  }
}
