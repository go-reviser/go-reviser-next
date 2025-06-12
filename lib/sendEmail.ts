import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    // port: Number(process.env.EMAIL_PORT),
    // secure: true, // true for 465, false for other ports
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
    });
}