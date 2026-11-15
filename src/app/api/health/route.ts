import { mailConfig } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function GET() {
  const mail = mailConfig();
  return Response.json({
    ok: true,
    service: "international-estimating",
    mailConfigured: mail.configured,
    mailSender: mail.from,
    mailRecipient: mail.to,
    time: new Date().toISOString(),
  });
}
