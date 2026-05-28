type SendEmailResult = { ok: true } | { ok: false; reason: string };

function formatFromEmail(raw: string | undefined | null): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "First Listen Mastering <onboarding@resend.dev>";
  // If already formatted like `Name <email@domain>`
  if (trimmed.includes("<") && trimmed.includes(">")) return trimmed;
  return `First Listen Mastering <${trimmed}>`;
}

export async function sendResendEmail(args: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = formatFromEmail(process.env.RESEND_FROM_EMAIL);

  if (!apiKey) {
    console.warn("[resend] RESEND_API_KEY missing; skipping email:", args.subject);
    return { ok: false, reason: "missing_api_key" };
  }

  try {
    console.info("[resend] sending", {
      to: `${args.to.slice(0, 2)}…`,
      subject: args.subject,
      from,
    });
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject: args.subject,
        html: args.html,
      }),
    });

    const raw = await res.text();
    if (!res.ok) {
      console.error("[resend] send failed", { status: res.status, body: raw.slice(0, 500) });
      return { ok: false, reason: "api_error" };
    }
    console.info("[resend] send ok", { status: res.status, body: raw.slice(0, 500) });
    return { ok: true };
  } catch (e) {
    console.error("[resend] send threw", e);
    return { ok: false, reason: "exception" };
  }
}

export function getStudioNotifyEmail(): string | null {
  return process.env.STUDIO_NOTIFY_EMAIL?.trim() || null;
}
