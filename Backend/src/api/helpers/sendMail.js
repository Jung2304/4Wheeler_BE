const nodemailer = require("nodemailer");

module.exports.sendMail = async (email, subject, html) => {
  console.log("📧 Starting email send process...");
  console.log("📧 Target email:", email);
  console.log("📧 SMTP Config:", {
    host: process.env.SMTP_HOST || "smtp.sendgrid.net",
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER || "apikey",
    hasApiKey: !!process.env.SENDGRID_API_KEY,
    from: process.env.EMAIL_FROM || "noreply@4wheeler.com"
  });

  try {
    // Use SendGrid for production, Gmail for local development
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.sendgrid.net",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // Use TLS (STARTTLS)
      auth: {
        user: process.env.SMTP_USER || "apikey", // SendGrid uses "apikey" as username
        pass: process.env.SMTP_PASS || process.env.SENDGRID_API_KEY
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
      debug: true, // Enable debug output
      logger: true  // Enable logging
    });

    console.log("📧 Transporter created, verifying connection...");
    
    // Test connection before sending
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully!");

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@4wheeler.com",
      to: email,
      subject: subject,
      html: html
    };

    console.log("📧 Sending email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
    console.log("✅ Message ID:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed!");
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error code:", error.code);
    console.error("❌ Error stack:", error.stack);
    throw error; // Propagate error to controller
  }
}; 