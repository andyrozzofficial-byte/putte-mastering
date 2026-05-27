type SendEmailResult = { ok: true } | { ok: false; reason: string };

export async function sendResendEmail(args: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";

  if (!apiKey) {
    console.warn("[resend] RESEND_API_KEY missing; skipping email:", args.subject);
    return { ok: false, reason: "missing_api_key" };
  }

  try {
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
    return { ok: true };
  } catch (e) {
    console.error("[resend] send threw", e);
    return { ok: false, reason: "exception" };
  }
}

export function getStudioNotifyEmail(): string | null {
  return process.env.STUDIO_NOTIFY_EMAIL?.trim() || null;
}
