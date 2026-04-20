// app/ui/components/emailtamplatetnt2.tsx

interface TNT2EmailTemplateProps {
  name: string;
  email: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
}

export function talkNTales2RegistrationConfirmationTemplate({
  name,
  eventDate,
  eventTime,
  eventLocation,
}: TNT2EmailTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Talk N Tales Vol. 2 — Registration Received</title>
</head>
<body style="margin:0;padding:0;background:#f7e6d4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7e6d4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

          <!-- ── TOP BAR ── -->
          <tr>
            <td style="background:#E8C12A;padding:10px 0;text-align:center;">
              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:11px;color:#2B3EBF;text-transform:uppercase;letter-spacing:0.2em;">
                TALK N TALES ✦ VOL. 2 ✦ NETWORKING ✦ GEN-Z FOUNDERS ✦ IRL EVENT ✦
              </span>
            </td>
          </tr>

          <!-- ── HERO ── -->
          <tr>
            <td style="background:#2B3EBF;padding:48px 40px 36px;text-align:left;">

              <!-- Date badge -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background:#E8121A;padding:4px 14px;">
                    <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:10px;color:#fff;text-transform:uppercase;letter-spacing:0.2em;">
                      9 May 2026 · South Jakarta
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Headline -->
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:64px;font-weight:900;text-transform:uppercase;letter-spacing:0.02em;line-height:0.9;color:#fff;margin-bottom:6px;">
                GOT IT.
              </div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:64px;font-weight:900;text-transform:uppercase;letter-spacing:0.02em;line-height:0.9;color:#E8C12A;margin-bottom:28px;">
                HANG TIGHT.
              </div>

              <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:rgba(255,255,255,0.8);line-height:1.7;margin:0;">
                Hey <strong style="color:#E8C12A;">${name}</strong> — we've received your registration for Talk N Tales Vol. 2. Our team will review and curate all submissions. If you're selected, we'll send you the official confirmation along with payment details.
              </p>
            </td>
          </tr>

          <!-- ── EVENT DETAILS ── -->
          <tr>
            <td style="background:#fff;border-left:6px solid #E8C12A;padding:32px 40px;">
              <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:10px;color:#E8121A;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 20px;">
                Event Details
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:14px;vertical-align:top;width:50%;">
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:4px;">Date</div>
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:15px;color:#1a1a1a;">${eventDate}</div>
                  </td>
                  <td style="padding-bottom:14px;vertical-align:top;">
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:4px;">Time</div>
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:15px;color:#1a1a1a;">${eventTime}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:14px;vertical-align:top;" colspan="2">
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:4px;">Location</div>
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:15px;color:#1a1a1a;">${eventLocation}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── WHAT HAPPENS NEXT ── -->
          <tr>
            <td style="background:#f7e6d4;padding:32px 40px;">
              <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:10px;color:#E8121A;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 18px;">
                What Happens Next
              </p>

              <!-- Step 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                <tr>
                  <td style="width:36px;vertical-align:top;padding-top:2px;">
                    <div style="background:#2B3EBF;width:26px;height:26px;display:inline-block;text-align:center;line-height:26px;">
                      <span style="font-family:Georgia,serif;font-weight:900;font-size:13px;color:#E8C12A;">1</span>
                    </div>
                  </td>
                  <td style="vertical-align:top;padding-left:12px;">
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:14px;color:#1a1a1a;margin-bottom:3px;">We review & curate your submission</div>
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:rgba(0,0,0,0.6);line-height:1.6;">We read every submission to make sure everyone in the room is genuinely building something.</div>
                  </td>
                </tr>
              </table>

              <!-- Step 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                <tr>
                  <td style="width:36px;vertical-align:top;padding-top:2px;">
                    <div style="background:#2B3EBF;width:26px;height:26px;display:inline-block;text-align:center;line-height:26px;">
                      <span style="font-family:Georgia,serif;font-weight:900;font-size:13px;color:#E8C12A;">2</span>
                    </div>
                  </td>
                  <td style="vertical-align:top;padding-left:12px;">
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:14px;color:#1a1a1a;margin-bottom:3px;">If selected, you'll get an official confirmation</div>
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:rgba(0,0,0,0.6);line-height:1.6;">We'll send payment instructions and final event details to this email address.</div>
                  </td>
                </tr>
              </table>

              <!-- Step 3 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:36px;vertical-align:top;padding-top:2px;">
                    <div style="background:#2B3EBF;width:26px;height:26px;display:inline-block;text-align:center;line-height:26px;">
                      <span style="font-family:Georgia,serif;font-weight:900;font-size:13px;color:#E8C12A;">3</span>
                    </div>
                  </td>
                  <td style="vertical-align:top;padding-left:12px;">
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:14px;color:#1a1a1a;margin-bottom:3px;">Show up & connect</div>
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:rgba(0,0,0,0.6);line-height:1.6;">Come ready to talk, share, and leave with connections that actually matter.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── SPAM NOTE ── -->
          <tr>
            <td style="background:#fff;padding:16px 40px;border-left:6px solid rgba(43,62,191,0.15);">
              <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:rgba(0,0,0,0.45);margin:0;line-height:1.6;">
                Can't find our next email? Check your <strong>spam or promotions folder</strong> and mark us as safe so you don't miss the announcement.
              </p>
            </td>
          </tr>

          <!-- ── EARLY BIRD REMINDER ── -->
          <tr>
            <td style="background:#E8121A;padding:20px 40px;text-align:center;">
              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:10px;color:rgba(255,255,255,0.9);text-transform:uppercase;letter-spacing:0.2em;">
                ✦ We’ll let you know if you’re selected by April 24, 2026. ✦
              </span>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background:#1a1a1a;padding:28px 40px;text-align:center;">
              <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:13px;color:#E8C12A;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">
                PACE ON
              </p>
              <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.4);margin:0 0 6px;">
                hi@paceon.id · Instagram: @paceon.id
              </p>
              <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.25);margin:0;">
                You received this email because you registered for Talk N Tales Vol. 2.
              </p>
            </td>
          </tr>

          <!-- Bottom bar -->
          <tr>
            <td style="background:#E8C12A;height:6px;"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}