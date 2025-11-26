export const eventCompletedEmailTemplate = (data: {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Completed - PACE ON</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%); padding: 40px 0;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: #f4f4ef; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden; border: 1px solid #e5e7eb;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 20px 20px; border-bottom: 2px solid #e0e0e0; background-color: #3f3e3d">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4ef; padding: 10px 20px 10px 10px; border-radius: 10px;">
                <tr>
                  <!-- Logo Kiri -->
                  <td width="80" align="left" valign="middle">
                    <img src="https://paceon.id/images/logo-paceon.png" alt="PACE ON" style="width: 60px; height: 60px; display: block;" />
                  </td>
                  <!-- Judul Email Kanan -->
                  <td align="right" valign="middle">
                    <h1 style="margin: 0; font-size: 20px; font-weight: bold; color: #fb6f7a; text-transform: uppercase;">
                      Event Completed!
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #1f2937;">Hi <strong style="color: #ec4899;">${data.name}</strong>,</p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #1f2937; line-height: 1.6;">
                The event <strong style="color: #ec4899;">${data.eventTitle}</strong> has been successfully completed! Thanks you for the participation on our another movement. I hope we can create another moment on our next movement.
              </p>

              <!-- Connections Box -->
              <div style="background: #f8fafc; border: 2px solid #2a6435; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #2a6435; font-size: 18px; font-weight: bold;">About Your Connections</h3>
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #111827;">
                  Your connections from this event have been automatically added to your network. Start building meaningful relationships today!
                </p>
                <a href="https://www.app.paceon.id" style="display: inline-block; background: #15803d; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Check On Dashboard</a>
              </div>

              <!-- Feedback & Affirmation Cube -->
              <div style="background: #f0fdf4; border: 2px solid #16a34a; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #15803d; font-size: 18px; font-weight: bold;">Share Your Feedback</h3>
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #111827;">
                  We value your feedback! Please share your experience and help us improve future events.
                </p>
                <a href="https://www.paceon.id/satisfactionform" style="display: inline-block; background: #15803d; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Give Feedback</a>
              </div>

              <div style="background: #fffbeb; border-radius: 12px; padding: 16px 20px; border: 2px solid #fbbf24; margin: 24px 0;">
                <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: bold;">Affirmation Cube</h4>
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #92400e;">
                  Don't forget to check out your affirmation cube and get daily inspiration!
                </p>
                <a href="https://app.paceon.id/affirmation-cube" style="display: inline-block; background: #fbbf24; color: #92400e; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Open Affirmation Cube</a>
              </div>

              <p style="margin: 24px 0 0 0; color: #1f2937; font-size: 16px;">
                Thank you for being part of this experience. We can't wait to see you at the next event!
              </p>

              <p style="margin: 16px 0 0 0; color: #1f4381; font-size: 16px; font-weight: 600;">
                Warm regards,<br>
                <span style="color: #2a6435; font-weight: bold;">PACE ON Team</span>
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer with Social Media -->
        <table width="600" cellpadding="20" cellspacing="0" border="0" style="margin-top: 24px;">
          <tr>
            <td style="text-align: center;">
              <!-- Social Media Icons -->
              <table cellpadding="0" cellspacing="0" style="display: inline-block; margin-bottom: 16px;">
                <tr>
                  <!-- Instagram -->
                  <td style="padding: 0 10px;">
                    <a href="https://instagram.com/paceon.id" target="_blank" style="text-decoration: none; display: inline-block;">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="6" fill="#374151"/>
                        <path d="M12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5Z" fill="white"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 12C6.5 8.96243 8.96243 6.5 12 6.5C15.0376 6.5 17.5 8.96243 17.5 12C17.5 15.0376 15.0376 17.5 12 17.5C8.96243 17.5 6.5 15.0376 6.5 12ZM12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5Z" fill="white"/>
                        <circle cx="17.5" cy="6.5" r="1" fill="white"/>
                      </svg>
                    </a>
                  </td>
                  <!-- LinkedIn -->
                  <td style="padding: 0 10px;">
                    <a href="https://linkedin.com/company/paceon" target="_blank" style="text-decoration: none; display: inline-block;">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="4" fill="#374151"/>
                        <path d="M8.5 9.5H6V17.5H8.5V9.5Z" fill="white"/>
                        <circle cx="7.25" cy="7.25" r="1.25" fill="white"/>
                        <path d="M13.5 9.5H11V17.5H13.5V13C13.5 11.5 15 11.5 15 13V17.5H17.5V12.5C17.5 9.5 14.5 9.5 13.5 11V9.5Z" fill="white"/>
                      </svg>
                    </a>
                  </td>
                  <!-- Email -->
                  <td style="padding: 0 10px;">
                    <a href="mailto:hi@paceon.id" style="text-decoration: none; display: inline-block;">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="6" fill="#374151"/>
                        <path d="M6 8L12 13L18 8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <rect x="5.5" y="7.5" width="13" height="9" rx="1" stroke="white" stroke-width="1.5"/>
                      </svg>
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Contact Links Text -->
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280;">
                <a href="https://instagram.com/paceon.id" target="_blank" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Instagram</a> | 
                <a href="https://linkedin.com/company/paceon" target="_blank" style="color: #6b7280; text-decoration: none; margin: 0 8px;">LinkedIn</a> | 
                <a href="mailto:hi@paceon.id" style="color: #6b7280; text-decoration: none; margin: 0 8px;">hi@paceon.id</a>
              </p>
              
              <!-- Copyright -->
              <div style="border-top: 2px solid #d1d5db; padding-top: 16px;">
                <p style="margin: 0; font-size: 12px; color: #374151;">
                  © 2025 <strong style="color: #2a6435;">PACE ON</strong> Community. All rights reserved.
                </p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280;">Keep The Pace On</p>
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