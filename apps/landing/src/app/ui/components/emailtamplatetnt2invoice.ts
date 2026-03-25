// app/ui/components/emailtemplatetnt2invoice.tsx

interface TNT2InvoiceEmailProps {
  name: string;
  email: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
}

export function talkNTales2InvoiceEmailTemplate({
  name,
  invoiceNumber,
  amount,
  dueDate,
}: TNT2InvoiceEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Talk N Tales Vol.2 — You're In!</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;padding:40px 16px;">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;">

    <!-- ── HEADER: LOGOS ── -->
    <tr>
      <td style="background:#ffffff;padding:28px 44px 24px;border-bottom:3px solid #E8C12A;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:middle;">
              <img src="https://www.paceon.id/images/logo-paceon.png" alt="PACE ON" style="height:32px;display:block;" />
            </td>
            <td align="right" style="vertical-align:middle;">
              <img src="https://www.paceon.id/images/logo-tnt2.png" alt="Talk N Tales Vol.2" style="height:36px;display:block;" />
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── MARQUEE TOP ── -->
    <tr>
      <td style="background:#E8C12A;padding:10px 0;text-align:center;">
        <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:11px;color:#2B3EBF;text-transform:uppercase;letter-spacing:0.2em;">
          TALK N TALES VOL. 2 &nbsp;·&nbsp; 9 MAY 2026 &nbsp;·&nbsp; SOUTH JAKARTA &nbsp;·&nbsp; IRL EVENT
        </span>
      </td>
    </tr>

    <!-- ── HERO ── -->
    <tr>
      <td style="background:#2B3EBF;padding:52px 44px 40px;">

        <!-- badge -->
        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:22px;">
          <tr>
            <td style="background:#E8121A;padding:5px 14px;">
              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:10px;color:#fff;text-transform:uppercase;letter-spacing:0.2em;">
                Official Selection
              </span>
            </td>
          </tr>
        </table>

        <!-- big headline -->
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:72px;font-weight:900;text-transform:uppercase;line-height:0.88;color:#E8C12A;letter-spacing:0.02em;margin-bottom:4px;">
          YOU'RE
        </div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:72px;font-weight:900;text-transform:uppercase;line-height:0.88;color:#fff;letter-spacing:0.02em;margin-bottom:32px;">
          IN.
        </div>

        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.75;margin:0;">
          Hey <strong style="color:#E8C12A;">${name}</strong> — you've been selected to join <strong style="color:#fff;">Talk N Tales Vol. 2</strong>. Secure your spot by completing the payment below before the deadline.
        </p>
      </td>
    </tr>

    <!-- ── INVOICE BLOCK ── -->
    <tr>
      <td style="background:#f9f9f9;border-left:6px solid #2B3EBF;padding:36px 44px;">

        <!-- invoice header -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
          <tr>
            <td>
              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:10px;color:#E8121A;text-transform:uppercase;letter-spacing:0.2em;">
                Invoice
              </span>
              <div style="font-family:Georgia,serif;font-size:28px;font-weight:900;color:#2B3EBF;text-transform:uppercase;letter-spacing:0.04em;margin-top:4px;">
                #${invoiceNumber}
              </div>
            </td>
            <td align="right" valign="top">
              <div style="background:#2B3EBF;padding:10px 20px;display:inline-block;">
                <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:10px;color:#E8C12A;text-transform:uppercase;letter-spacing:0.15em;">
                  Payment Deadline
                </span>
                <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:14px;color:#fff;margin-top:2px;">
                  ${dueDate}
                </div>
              </div>
            </td>
          </tr>
        </table>

        <!-- divider -->
        <div style="height:3px;background:#E8C12A;margin-bottom:24px;"></div>

        <!-- amount -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
          <tr>
            <td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:12px;color:#aaa;text-transform:uppercase;letter-spacing:0.18em;padding-bottom:6px;" colspan="2">
              Amount Due
            </td>
          </tr>
          <tr>
            <td style="font-family:Georgia,serif;font-size:40px;font-weight:900;color:#2B3EBF;letter-spacing:0.02em;">
              ${amount}
            </td>
            <td align="right" valign="bottom">
              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:10px;color:#2B3EBF;text-transform:uppercase;letter-spacing:0.15em;background:rgba(43,62,191,0.08);padding:4px 10px;">
                Early Bird
              </span>
            </td>
          </tr>
        </table>

        <!-- divider -->
        <div style="height:2px;background:rgba(43,62,191,0.15);margin-bottom:28px;"></div>

        <!-- payment details -->
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:10px;color:#E8121A;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 16px;">
          Payment Options
        </p>

        <!-- Sea Bank -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;border-left:4px solid #E8C12A;padding-left:14px;">
          <tr>
            <td>
              <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:13px;color:#2B3EBF;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Sea Bank</div>
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;width:130px;padding-bottom:4px;">Account No.</td>
                  <td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:15px;color:#2B3EBF;letter-spacing:0.08em;padding-bottom:4px;">9012 8311 7886</td>
                </tr>
                <tr>
                  <td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Account Name</td>
                  <td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:13px;color:#1a1a1a;">M Rifki Ramdhani S</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- BCA -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;border-left:4px solid #E8C12A;padding-left:14px;">
          <tr>
            <td>
              <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:13px;color:#2B3EBF;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">BCA</div>
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;width:130px;padding-bottom:4px;">Account No.</td>
                  <td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:15px;color:#2B3EBF;letter-spacing:0.08em;padding-bottom:4px;">5735 326 594</td>
                </tr>
                <tr>
                  <td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Account Name</td>
                  <td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:13px;color:#1a1a1a;">M Rifki Ramdhani S</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- deadline note (clean, no icon) -->
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:#888;line-height:1.7;margin:0;">
          Payment deadline is <strong style="color:#1a1a1a;">${dueDate} 23:59 WIB</strong>. Your slot will be held until then.
        </p>

      </td>
    </tr>

    <!-- ── EVENT DETAILS ── -->
    <tr>
      <td style="background:#ffffff;padding:36px 44px;">

        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:10px;color:#E8121A;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 20px;">
          Event Details
        </p>

        <!-- date + location -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          <tr>
            <td style="width:50%;padding-right:12px;vertical-align:top;">
              <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:4px;">Date</div>
              <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:15px;color:#1a1a1a;">Saturday, 9 May 2026</div>
            </td>
            <td style="vertical-align:top;">
              <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:4px;">Location</div>
              <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:15px;color:#1a1a1a;">South Jakarta <span style="color:#aaa;font-weight:400;">(TBA)</span></div>
            </td>
          </tr>
        </table>

        <!-- rundown -->
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:10px;color:#2B3EBF;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 14px;">
          Event Rundown
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${[
            ["Session 1", "Game Group Session"],
            ["Session 2", "Senior Founder Roundtable Networking"],
            ["Session 3", "Speed Networking"],
            ["Session 4", "Free Networking Session"],
          ].map(([time, label], i) => `
          <tr>
            <td style="padding:10px 14px;vertical-align:top;width:30%;background:${i % 2 === 0 ? '#2B3EBF' : '#f0f2fc'};border-bottom:2px solid #ffffff;">
              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:11px;color:${i % 2 === 0 ? '#E8C12A' : '#2B3EBF'};text-transform:uppercase;letter-spacing:0.12em;">${time}</span>
            </td>
            <td style="padding:10px 14px;vertical-align:top;background:${i % 2 === 0 ? '#eef0fb' : '#f9f9f9'};border-bottom:2px solid #ffffff;">
              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:14px;color:#1a1a1a;">${label}</span>
            </td>
          </tr>`).join('')}
        </table>
      </td>
    </tr>

    <!-- ── NEXT STEPS ── -->
    <tr>
      <td style="background:#2B3EBF;padding:32px 44px;">
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:10px;color:#E8C12A;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 18px;">
          What Happens Next
        </p>
        ${[
          ["1", "Complete your payment", "Transfer to either bank account above before the deadline."],
          ["2", "Send payment proof", "DM us on Instagram @paceon.id or reply to this email with your transfer receipt."],
          ["3", "Receive your e-ticket", "You'll get a payment confirmation and e-ticket within 1x24 hours after we verify your payment."],
        ].map(([num, title, desc]) => `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
          <tr>
            <td style="width:32px;vertical-align:top;padding-top:2px;">
              <div style="background:#E8C12A;width:26px;height:26px;text-align:center;line-height:26px;">
                <span style="font-family:Georgia,serif;font-weight:900;font-size:13px;color:#2B3EBF;">${num}</span>
              </div>
            </td>
            <td style="padding-left:12px;vertical-align:top;">
              <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:14px;color:#fff;margin-bottom:3px;">${title}</div>
              <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.65);line-height:1.6;">${desc}</div>
            </td>
          </tr>
        </table>`).join('')}
      </td>
    </tr>

    <!-- ── DEADLINE BAR ── -->
    <tr>
      <td style="background:#1a1a1a;padding:18px 44px;text-align:center;">
        <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.2em;">
          Payment deadline
        </span>
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:15px;color:#ffffff;letter-spacing:0.08em;margin-top:4px;">
          ${dueDate} &nbsp;·&nbsp; ${amount}
        </div>
      </td>
    </tr>

    <!-- ── FOOTER ── -->
    <tr>
      <td style="background:#ffffff;padding:28px 44px;text-align:center;border-top:3px solid #E8C12A;">
        <img src="https://www.paceon.id/images/logo-paceon.png" alt="PACE ON" style="height:24px;display:block;margin:0 auto 12px;" />
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:#aaa;margin:0 0 6px;">
          hi@paceon.id &nbsp;·&nbsp; @paceon.id
        </p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;color:#ccc;margin:0;">
          You received this because you registered for Talk N Tales Vol. 2.
        </p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>

</body>
</html>
  `.trim();
}