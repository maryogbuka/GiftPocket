// lib/email.js
import { Resend } from "resend";
import ResetPasswordEmail from "../emails/ResetPasswordEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetPasswordEmail(toEmail, resetUrl) {
  const { data, error } = await resend.emails.send({
    from: "Your App <mhycienth57@gmail.com>", 
    to: [toEmail],
    subject: "Reset your password",
    react: <ResetPasswordEmail resetUrl={resetUrl} />,
  });

  if (error) {
    console.error("Error sending reset password email:", error);
    throw new Error("Failed to send reset password email");
  }

  return data;
}
