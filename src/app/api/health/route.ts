import { mailConfig } from "@/lib/mailer";

export const dynamic = "force-dynamic";

// Public endpoint: reports only whether mail is configured, never the addresses themselves.
export async function GET() {
  const { configured } = mailConfig();
  return Response.json({
    ok: true,
    service: "international-estimating",
    mailConfigured: configured,
    time: new Date().toISOString(),
  });
}
