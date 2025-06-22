import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: `"Quản trị viên Milk Tea" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Mã xác thực OTP của bạn',
    text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`,
    html: `<p><b>Mã OTP của bạn:</b> <span style="font-size: 20px">${otp}</span></p><p>Mã này có hiệu lực trong 5 phút.</p>`,
  });
}
