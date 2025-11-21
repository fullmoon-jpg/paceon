// lib/utils/talkNTalesEmailTemplate.ts

export const talkNTalesRegistrationConfirmationTemplate = (data: {
  name: string;
  email: string;
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
  <title>Talk n Tales - Registration Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4ef;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4ef; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="750" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);">
          
          <!-- Header - with Big Product Logo and Small Logo -->
          <tr>
            <td style="background: #3f3e3d; padding: 20px 20px 40px 20px; text-align: center; position: relative;">
              <div style="background: #f4f4ef; padding: 20px 20px; border-radius: 20px;">
                <!-- Small Logo Top Left -->
                <div style="position: absolute; top: 40px; left: 40px;">
                    <img src="https://paceon.id/images/logo-paceon.png" alt="PACE ON Logo" style="width: 48px; height: 48px; display: block; object-fit: contain; border-radius: 10px;" />
                </div>
                
                <!-- Main Product Logo Center -->
                <div style="background: #f4f4ef; border-radius: 14px; padding: 40px 0 40px 0; margin: 0 auto 0 auto; width: 300px;">
                    <img src="https://paceon.id/images/product-logo.png" alt="PACE ON" style="width: 180px; height: 180px; border-radius: 18px; display: block; margin: 0 auto; object-fit: contain;" />
                </div>
              </div>
              
              <!-- Invoice Title -->
              <div style="background: #f47a49; padding: 16px 36px; margin: 34px auto 0 auto; display: inline-block;">
                <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #fff; letter-spacing: 2px; text-transform: uppercase; line-height: 1.2;">
                  REGISTRATION COMPLETE
                </h1>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 60px 50px;">
              
              <p style="margin: 0 0 28px 0; font-size: 22px; color: #3f3e3d; line-height: 1.6;">
                Hey <strong style="color: #f47a49;">${data.name}</strong>!
              </p>
              
              <p style="margin: 0 0 40px 0; font-size: 18px; color: #3f3e3d; line-height: 1.8;">
                Thank you so much for your interest in <strong>Talk n Tales</strong>! We've successfully received your registration and truly appreciate you taking the time to full fill the form.
              </p>

              <p style="margin: 0 0 40px 0; font-size: 18px; color: #3f3e3d; line-height: 1.8;">
                Our team will carefully review all applications. <strong>If you're selected</strong>, you'll receive an official announcement email along with payment details between <strong style="color: #f47a49;">8th December 2025 - 11th December 2025</strong>. Please keep an eye on your inbox and spam folder!
              </p>

              <!-- Registration Program Timeline (Equal Height Boxes) -->
              <div style="margin: 50px 0;">
                <h3 style="margin: 0 0 36px 0; font-size: 26px; font-weight: bold; color: #3f3e3d; text-align: center;">
                  Registration Program Timeline
                </h3>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="height: 100%;">
                  <tr>
                    <!-- Registration Phase - Equal Height -->
                    <td width="48%" valign="top" style="height: 100%;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="height: 100%;">
                        <tr>
                          <td style="background: #dcfce7; border: 3px solid #10b981; padding: 32px; text-align: center; height: 100%; vertical-align: middle;">
                            <div style="background: #10b981; color: white; display: inline-block; padding: 10px 24px; border-radius: 20px; font-size: 16px; font-weight: bold; margin-bottom: 20px;">
                              STEP 1
                            </div>
                            <h4 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: #065f46;">
                              Registration
                            </h4>
                            <p style="margin: 0; font-size: 16px; color: #065f46; line-height: 1.6;">
                              <strong>Now — December 7, 2025</strong><br>
                              Submit your application
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td width="4%"></td>
                    <!-- Announcement & Payment Phase - Equal Height -->
                    <td width="48%" valign="top" style="height: 100%;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="height: 100%;">
                        <tr>
                          <td style="background: #fce7f3; border: 3px solid #ec4899; padding: 32px; text-align: center; height: 100%; vertical-align: middle;">
                            <div style="background: #ec4899; color: white; display: inline-block; padding: 10px 24px; border-radius: 20px; font-size: 16px; font-weight: bold; margin-bottom: 20px;">
                              STEP 2
                            </div>
                            <h4 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: #9f1239;">
                              Announcement & Payment
                            </h4>
                            <p style="margin: 0; font-size: 16px; color: #9f1239; line-height: 1.6;">
                              <strong>December 8-11, 2025</strong><br>
                              Selected participants notified
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Stay Updated - Background No Rounded, CTA Rounded -->
              <div style="background: #f47a49; padding: 36px; margin: 40px 0; text-align: center;">
                <h3 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #ffffff;">
                  Stay Updated
                </h3>
                <p style="margin: 0 0 24px 0; font-size: 17px; color: rgba(255,255,255,0.95); line-height: 1.7;">
                  Follow us for the latest updates, event highlights, and community stories:
                </p>
                <div>
                  <a href="https://instagram.com/paceon.id" style="display: inline-block; background: #F0C946; color: #3f3e3d; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 17px; margin: 10px;">
                    Instagram @paceon.id
                  </a>
                  <a href="https://paceon.id" style="display: inline-block; background: #F0C946; color: #3f3e3d; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 17px; margin: 10px;">
                    Website paceon.id
                  </a>
                </div>
              </div>

              <!-- Closing -->
              <p style="margin: 40px 0 0 0; font-size: 18px; color: #3f3e3d; line-height: 1.8; text-align: center;">
                Got questions? Hit us up on Instagram or reply to this email!<br>
              </p>

              <div style="margin: 40px 0 0 0; padding-top: 40px; border-top: 2px solid #f4f4ef; text-align: center;">
                <p style="margin: 0 0 12px 0; font-size: 18px; color: #3f3e3d; font-weight: 600;">
                  Thanks for your interest!
                </p>
                <p style="margin: 0; font-size: 24px; color: #f47a49; font-weight: 900; letter-spacing: 1px;">
                  PACE ON TEAM
                </p>
              </div>

            </td>
          </tr>

          <!-- Simple Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #3f3e3d 0%, #2d2c2b 100%); padding: 40px 50px; text-align: center;">
              <p style="margin: 0 0 12px 0; font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.6;">
                © 2025 PACE ON Community. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.9); font-weight: 600;">
                Keep the PACE ON
              </p>
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