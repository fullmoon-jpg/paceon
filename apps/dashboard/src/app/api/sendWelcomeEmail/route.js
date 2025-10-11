import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request) {
    console.log("📧 Welcome email API called");

    try {
        const body = await request.json();
        console.log("📨 Request body:", body);
        
        const { email, name } = body;

        if (!email) {
            console.log("❌ No email provided");
            return NextResponse.json(
                { message: "Email is required" }, 
                { status: 400 }
            );
        }

        console.log("🔧 Creating email transporter...");
        const transporter = nodemailer.createTransport({
            host: "mx4.mailspace.id", 
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAILSPACE_USER,
                pass: process.env.MAILSPACE_PASSWORD, 
            },
            debug: true, // Enable debug
            logger: true // Enable logging
        });

        // Verify transporter configuration
        console.log("🔍 Verifying transporter...");
        await transporter.verify();
        console.log("✅ Transporter verified successfully");

        console.log("📝 Preparing email...");
        const displayName = name || email.split('@')[0];
        
        const mailOptions = {
            from: '"PACE.ON" <hi@paceon.id>',
            to: email,
            subject: "Welcome to PACE.ON - Let's Get Started! 🎉",
            html: `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%); padding: 40px 0; font-family: 'Segoe UI', Arial, sans-serif;">
                  <tr>
                    <td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden; border: 1px solid #e5e7eb;">
                        
                        <tr>
                          <td style="background: linear-gradient(135deg, #15b392 0%, #2a6435 50%, #15b392 100%); padding: 40px 30px; text-align: center;">
                            <div style="margin-bottom: 16px;">
                              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                PACE.ON
                              </h1>
                            </div>
                            <h2 style="margin: 0 0 8px 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                              Welcome to the Community! 🎉
                            </h2>
                            <p style="margin: 0; color: rgba(255, 255, 255, 0.95); font-size: 15px;">
                              You're ready to connect with amazing people
                            </p>
                          </td>
                        </tr>

                        <tr>
                          <td style="padding: 40px 30px;">
                            
                            <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                              Hey ${displayName}! 👋
                            </p>
                            
                            <p style="margin: 0 0 24px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                              Thanks for signing up with <strong style="color: #2a6435;">PACE.ON</strong>! We're excited to have you join our community of founders, professionals, and sports enthusiasts who believe in building meaningful connections.
                            </p>

                            <p style="margin: 0 0 32px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                              Your account is all set up and ready to go! You can now explore everything PACE.ON has to offer.
                            </p>

                            <div style="text-align: center; margin: 32px 0;">
                              <a href="https://app.paceon.id/dashboard" style="display: inline-block; background: linear-gradient(135deg, #2a6435 0%, #15b392 100%); color: #ffffff; text-decoration: none; font-weight: bold; font-size: 18px; padding: 16px 48px; border-radius: 50px; box-shadow: 0 10px 20px rgba(42, 100, 53, 0.3); transition: all 0.3s; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                                Get Started →
                              </a>
                            </div>

                            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; border-left: 4px solid #16a34a; margin: 32px 0; padding: 24px;">
                              <h3 style="margin: 0 0 12px 0; color: #15803d; font-size: 18px; font-weight: bold;">
                                What happens next?
                              </h3>
                              <ul style="margin: 0; padding-left: 20px; color: #14532d; font-size: 15px; line-height: 1.8;">
                                <li style="margin-bottom: 8px;">Complete your profile and matchmaking preferences</li>
                                <li style="margin-bottom: 8px;">Discover events and connect with like-minded people</li>
                                <li style="margin-bottom: 8px;">Join our exclusive community activities</li>
                                <li>Build lasting relationships on and off the court</li>
                              </ul>
                            </div>

                            <div style="border-top: 1px solid #e5e7eb; margin: 32px 0;"></div>

                            <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                              Ready to start your journey? We can't wait to see you at our next event!
                            </p>
                            
                            <p style="margin: 0; color: #1f4381; font-size: 16px; font-weight: 600;">
                              To new connections,<br>
                              <span style="color: #2a6435; font-weight: bold;">The PACE.ON Team</span>
                            </p>

                          </td>
                        </tr>

                        <tr>
                          <td style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center;">
                              💡 <strong>Need Help?</strong> If you have any questions, feel free to reach out to us at 
                              <a href="mailto:hi@paceon.id" style="color: #2a6435; text-decoration: none; font-weight: 600;">hi@paceon.id</a>
                            </p>
                          </td>
                        </tr>
                      </table>

                      <table width="600" cellpadding="16" cellspacing="0" border="0" style="margin-top: 24px;">
                        <tr>
                          <td style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #6b7280; text-align: center; line-height: 1.5;">
                            <div style="border-top: 2px solid #e5e7eb; padding-top: 16px;">
                              © 2025 <strong style="color: #2a6435;">PACE.ON</strong> Community. All rights reserved.<br>
                              <span style="font-size: 11px; color: #9ca3af;">Creating meaningful connections through sports and networking</span><br>
                              <div style="margin-top: 12px;">
                                <a href="https://www.paceon.id" style="color: #2a6435; text-decoration: none; font-weight: 600; margin: 0 8px;">Website</a>
                                <span style="color: #d1d5db;">|</span>
                                <a href="https://instagram.com/paceon.id" style="color: #2a6435; text-decoration: none; font-weight: 600; margin: 0 8px;">Instagram</a>
                                <span style="color: #d1d5db;">|</span>
                                <a href="https://www.linkedin.com/company/pace-on/" style="color: #2a6435; text-decoration: none; font-weight: 600; margin: 0 8px;">LinkedIn</a>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>
                </table>
            `,
        };

        console.log("📤 Sending email to:", email);
        const info = await transporter.sendMail(mailOptions);
        
        console.log("✅ Email sent successfully!");
        console.log("📬 Message ID:", info.messageId);
        console.log("📊 Response:", info.response);
        
        return NextResponse.json({ 
            success: true,
            message: "Welcome email sent successfully",
            email: email,
            messageId: info.messageId
        });
        
    } catch (error) {
        console.error("❌ Email API Error:", error);
        console.error("🔍 Error details:", {
            message: error.message,
            code: error.code,
            command: error.command,
            stack: error.stack
        });
        
        return NextResponse.json(
            { 
                success: false,
                message: "Failed to send email", 
                error: error.message,
                errorCode: error.code || 'UNKNOWN_ERROR',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }, 
            { status: 500 }
        );
    };
}
