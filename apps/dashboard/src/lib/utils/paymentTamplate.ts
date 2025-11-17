// lib/utils/paymentTamplate.ts

export const bookingConfirmationEmailTemplate = (data: {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation & Payment Invoice</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%); padding: 40px 0;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden; border: 1px solid #e5e7eb;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2a6435 0%, #15b392 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">BOOKING CONFIRMED!</h1>
              <p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Payment Invoice - PACE ON</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #1f2937;">Hi <strong style="color: #1f4381;">${data.name}</strong>,</p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #1f2937; line-height: 1.6;">
                Your booking for <strong>${data.eventTitle}</strong> has been confirmed! Below are your event details and payment information.
              </p>

              <!-- Event Details Box -->
              <div style="background: #f0fdf4; border: 2px solid #15b392; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #15803d; font-size: 18px; font-weight: bold;">Event Details</h3>
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px; color: #111827;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Event:</td>
                    <td style="padding: 8px 0 8px 12px;">${data.eventTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                    <td style="padding: 8px 0 8px 12px;">${data.eventDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Time:</td>
                    <td style="padding: 8px 0 8px 12px;">${data.eventTime} WIB</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Location:</td>
                    <td style="padding: 8px 0 8px 12px;">${data.eventLocation}</td>
                  </tr>
                </table>
              </div>

              <!-- Invoice Box -->
              <div style="background: #f8fafc; border: 2px solid #2a6435; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #2a6435; font-size: 18px; font-weight: bold;">Payment Invoice</h3>
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px; color: #111827;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Invoice Number:</td>
                    <td style="padding: 8px 0 8px 12px; font-family: monospace; color: #2a6435;">${data.invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Amount Due:</td>
                    <td style="padding: 8px 0 8px 12px; color: #2a6435; font-size: 18px; font-weight: bold;">${data.amount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Due Date:</td>
                    <td style="padding: 8px 0 8px 12px;">${data.dueDate} 09:00 WIB</td>
                  </tr>
                </table>
              </div>

              <!-- Bank Account Details -->
              <div style="background: #f0fdf4; border: 2px solid #16a34a; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #15803d; font-size: 18px; font-weight: bold;">
                  Silahkan Transfer ke Rekening:
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px; color: #111827;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Bank:</td>
                    <td style="padding: 8px 0 8px 12px;">Sea Bank (Transfer)</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Nomor Rekening:</td>
                    <td style="padding: 8px 0 8px 12px; font-weight: bold; color: #15803d; font-size: 16px; font-family: monospace;">9012 8311 7886</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Atas Nama:</td>
                    <td style="padding: 8px 0 8px 12px;">M Rifki Ramdhani S</td>
                  </tr>
                </table>
              </div>

              <!-- Payment Deadline Alert -->
              <div style="margin: 24px 0; background: #fef2f2; border-radius: 12px; padding: 16px 20px; border: 2px solid #dc2626;">
                <p style="margin: 0; color: #dc2626; font-size: 14px; line-height: 1.5;">
                  Please complete the payment before <strong>${data.dueDate} 09:00 am WIB</strong>. Late payments may affect your booking confirmation.
                </p>
              </div>

              <!-- Instructions -->
              <div style="background: #fffbeb; border-radius: 12px; padding: 16px 20px; border: 2px solid #fbbf24; margin: 24px 0;">
                <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: bold;">Payment Instructions:</h4>
                <ol style="margin: 0; padding-left: 16px; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <li>Open your banking app or visit Sea Bank</li>
                  <li>Transfer to account <strong>9012 8311 7886</strong></li>
                  <li>Make sure the amount matches: <strong>${data.amount}</strong></li>
                  <li>Your booking will be confirmed after payment is received</li>
                </ol>
              </div>

              <p style="margin: 24px 0 0 0; color: #1f2937; font-size: 16px;">
                Thank you for being part of this experience. We can't wait to see you on the court!
              </p>

              <p style="margin: 16px 0 0 0; color: #1f4381; font-size: 16px; font-weight: 600;">
                Warm regards,<br>
                <span style="color: #2a6435; font-weight: bold;">PACE ON Team</span>
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="600" cellpadding="16" cellspacing="0" border="0" style="margin-top: 24px;">
          <tr>
            <td style="font-size: 12px; color: #374151; text-align: center; line-height: 1.5;">
              <div style="border-top: 2px solid #d1d5db; padding-top: 16px;">
                © 2025 <strong style="color: #2a6435;">PACE ON</strong> Community. All rights reserved.<br>
                <span style="font-size: 11px; color: #4b5563;">Creating meaningful connections through sports and networking</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
