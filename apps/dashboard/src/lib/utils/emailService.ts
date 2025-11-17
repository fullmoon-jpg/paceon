// lib/utils/emailService.ts
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: 'mx4.mailspace.id',
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAILSPACE_USER,
        pass: process.env.MAILSPACE_PASSWORD,
    },
});