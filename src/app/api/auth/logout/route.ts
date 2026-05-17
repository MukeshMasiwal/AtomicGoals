import { logAudit } from "@/lib/audit";
import { clearSessionCookie, getSessionFromCookies } from "@/lib/auth";

export async function POST() {
  const user = await getSessionFromCookies();

  if (user) {
    await logAudit({
      action: "user.logout",
      actorEmail: user.email,
      targetType: "user",
      targetId: user.id,
    });
  }

  await clearSessionCookie();
  return Response.json({ ok: true });
}
