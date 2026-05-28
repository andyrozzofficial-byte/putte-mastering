import { escapeHtml } from "@/lib/email/escape-html";

export type BrandedEmailArgs = {
  title: string;
  intro?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  meta?: Array<{ label: string; value: string }>;
  footerEmail?: string;
};

export function renderBrandedEmail(args: BrandedEmailArgs): string {
  const meta = args.meta ?? [];
  const safeTitle = escapeHtml(args.title);
  const safeIntro = args.intro ? escapeHtml(args.intro) : "";
  const ctaLabel = args.ctaLabel ? escapeHtml(args.ctaLabel) : "";
  const ctaUrl = args.ctaUrl ? escapeHtml(args.ctaUrl) : "";
  const footerEmail = args.footerEmail ? escapeHtml(args.footerEmail) : "studio@firstlistenmastering.com";

  const metaRows = meta
    .map(
      (m) => `
        <tr>
          <td style="padding:10px 12px;border-top:1px solid #ececec;color:#666;font-size:13px;">${escapeHtml(m.label)}</td>
          <td style="padding:10px 12px;border-top:1px solid #ececec;color:#111;font-size:13px;text-align:right;">${escapeHtml(m.value)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f7f7f7;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="padding:28px 14px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e9e9e9;border-radius:16px;overflow:hidden;">
        <div style="padding:22px 20px;border-bottom:1px solid #f0f0f0;">
          <div style="letter-spacing:0.22em;text-transform:uppercase;font-size:11px;font-weight:700;color:#111;">
            First Listen Mastering
          </div>
          <div style="margin-top:10px;font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#111;line-height:1.2;">
            ${safeTitle}
          </div>
          ${safeIntro ? `<div style="margin-top:10px;font-size:14px;line-height:1.6;color:#555;">${safeIntro}</div>` : ""}
          ${
            ctaUrl && ctaLabel
              ? `<div style="margin-top:18px;">
                   <a href="${ctaUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 16px;border-radius:10px;font-size:14px;font-weight:600;">
                     ${ctaLabel}
                   </a>
                 </div>`
              : ""
          }
        </div>

        ${
          metaRows
            ? `<div style="padding:0 20px 6px 20px;">
                 <div style="margin-top:16px;border:1px solid #efefef;border-radius:12px;overflow:hidden;">
                   <table style="width:100%;border-collapse:collapse;">
                     ${metaRows}
                   </table>
                 </div>
               </div>`
            : ""
        }

        <div style="padding:20px;color:#666;font-size:12px;line-height:1.6;">
          <div style="color:#111;font-weight:700;">First Listen Mastering</div>
          <div>Manual analog mastering studio</div>
          <div><a href="mailto:${footerEmail}" style="color:#111;text-decoration:underline;text-underline-offset:3px;">${footerEmail}</a></div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

