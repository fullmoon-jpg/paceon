import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request) {
    console.log("Welcome email API called");

    try {
        const body = await request.json();
        console.log("📨 Request body:", body);
        
        const { email, name } = body;

        if (!email) {
            console.log("No email provided");
            return NextResponse.json(
                { message: "Email is required" }, 
                { status: 400 }
            );
        }

        console.log("Creating transporter...");
        const transporter = nodemailer.createTransport({
            host: "mx4.mailspace.id", 
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAILSPACE_USER,
                pass: process.env.MAILSPACE_PASSWORD, 
            },
        });

        console.log("Preparing email...");
        const mailOptions = {
            from: '"PACE.ON" <hi@paceon.id>',
            to: email,
            subject: "Hi Doers, Welcome to Pace.On!",
            html: `
                <div style="font-family: Arial, sans-serif; line-height:1.5;">
                    <div style="text-align:center;">
                        <img src="https://app.paceon.id/images/og-image.webp" alt="Pace.On" style="max-width:100%; height:auto;"/>
                    </div>
                    <p>Hi ${name || "User"},</p>
                    <p>Welcome to <strong>Pace.On</strong>! We're excited to have you onboard.</p>
                    <p>This is an automated message from <em>hi@paceon.id</em>.</p>
                    <hr style="border:none; border-top:1px solid #ccc; margin:20px 0;" />
                    <div style="font-size:12px; color:#888; text-align:center;">
                        <p>Pace.On Team | <a href="https://paceon.id" target="_blank">pace.on</a></p>
                        <a href="https://www.instagram.com/paceon.id/?utm_source=ig_web_button_share_sheet" target="_blank" style="margin:0 5px;">
                            <img src="https://cdn-icons-png.flaticon.com/24/2111/2111463.png" alt="Instagram" style="width:24px; height:24px;"/>
                        </a>
                        <a href="https://www.linkedin.com/company/pace-on/" target="_blank" style="margin:0 5px;">
                            <img src="https://cdn-icons-png.flaticon.com/24/174/174857.png" alt="LinkedIn" style="width:24px; height:24px;"/>
                        </a>
                    </div>
                </div>
            `,
        };

        console.log("Sending email...");
        await transporter.sendMail(mailOptions);
        
        console.log("Email sent successfully to:", email);
        return NextResponse.json({ 
            message: "Email sent successfully",
            email: email 
        });
        
    } catch (error) {
        console.error("API Error:", error);
        console.error("Error stack:", error.stack);
        
        return NextResponse.json(
            { 
                message: "Failed to send email", 
                error: error.message,
                details: error.stack 
            }, 
            { status: 500 }
        );
    }
}