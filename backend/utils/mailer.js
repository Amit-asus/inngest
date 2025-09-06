import { createTransport } from "nodemailer";

export const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = createTransport({
      host: process.env.MAILTRAP_SMTP_HOST,
      port: process.env.MAILTRAP_SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: '"Inngest Tms Team" <maddison53@ethereal.email>',
      to: to,
      subject: subject,
      text: text, 
      html: html,
    });
    console.log("Message sent:", info.messageId);
    return info ;
  } catch (error) {
    console.log("Error sending email", error);
    throw new Error(error);
  }
};
