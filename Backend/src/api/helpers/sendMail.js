const nodemailer = require("nodemailer");

module.exports.sendMail = async (email, subject, html) => {
  try {
    // Use SendGrid for production, Gmail for local development
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.sendgrid.net",
      port: process.env.SMTP_PORT || 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.SMTP_USER || "apikey", // SendGrid uses "apikey" as username
        pass: process.env.SMTP_PASS || process.env.SENDGRID_API_KEY
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@4wheeler.com",
      to: email,
      subject: subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error; // Propagate error to controller
  }
}; 