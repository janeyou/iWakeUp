import { Resend } from "resend";
import ConfirmSignup from "@/emails/ConfirmSignup";
import WeeklyDigest from "@/emails/WeeklyDigest";
import type { EntryRow } from "@/lib/db";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM ?? "AI Radar <hi@janeyoubradley.com>";

const client = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function sendConfirmEmail(email: string, confirmToken: string): Promise<void> {
  const confirmUrl = `${siteUrl()}/api/subscribe/confirm?token=${confirmToken}`;
  if (!client) {
    console.log(`[email] dry-run confirm to ${email}: ${confirmUrl}`);
    return;
  }
  const { error } = await client.emails.send({
    from: RESEND_FROM,
    to: email,
    subject: "Confirm your AI Radar digest",
    react: ConfirmSignup({ confirmUrl }),
  });
  if (error) throw new Error(`Resend send failed: ${error.message}`);
}

export async function sendDigestEmail(args: {
  to: string;
  unsubscribeToken: string;
  entries: EntryRow[];
  agentNameBySlug: Record<string, string>;
  weekLabel: string;
  approveUrl?: string;
}): Promise<void> {
  const unsubscribeUrl = `${siteUrl()}/api/subscribe/unsubscribe?token=${args.unsubscribeToken}`;
  const subjectPrefix = args.approveUrl ? "[PREVIEW] " : "";
  if (!client) {
    console.log(`[email] dry-run digest to ${args.to}: ${args.entries.length} entries`);
    return;
  }
  const { error } = await client.emails.send({
    from: RESEND_FROM,
    to: args.to,
    subject: `${subjectPrefix}AI Radar · ${args.weekLabel}`,
    react: WeeklyDigest({
      entries: args.entries,
      agentNameBySlug: args.agentNameBySlug,
      weekLabel: args.weekLabel,
      unsubscribeUrl,
      approveUrl: args.approveUrl,
    }),
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  if (error) throw new Error(`Resend send failed: ${error.message}`);
}
