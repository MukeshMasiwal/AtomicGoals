import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    
    const notifications = await Notification.find({ recipient: session.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as { id?: string };
    const id = body?.id;

    await connectDB();

    if (id) {
      await Notification.updateOne(
        { _id: id, recipient: session.id },
        { $set: { isRead: true } }
      );
    } else {
      await Notification.updateMany(
        { recipient: session.id },
        { $set: { isRead: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as { id?: string };
    const id = body?.id;

    await connectDB();

    if (!id) {
      // Delete all read notifications or all notifications
      await Notification.deleteMany({ recipient: session.id });
      return NextResponse.json({ success: true });
    }

    await Notification.deleteOne({ _id: id, recipient: session.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 },
    );
  }
}
