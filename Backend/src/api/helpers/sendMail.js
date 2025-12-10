const sgMail = require("@sendgrid/mail");

module.exports.sendMail = async (email, subject, html) => {
  console.log("📧 Starting email send process...");
  console.log("📧 Target email:", email);
  
  const sendgridKey = process.env.SENDGRID_API_KEY;
  
  if (!sendgridKey) {
    throw new Error("SENDGRID_API_KEY not configured in environment variables");
  }

  console.log("📧 Using SendGrid HTTP API (bypasses firewall issues)");
  console.log("📧 API Key present:", !!sendgridKey);
  console.log("📧 From address:", process.env.EMAIL_FROM || "noreply@4wheeler.com");

  try {
    // Configure SendGrid with API key
    sgMail.setApiKey(sendgridKey);

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || "noreply@4wheeler.com",
      subject: subject,
      html: html
    };

    console.log("📧 Sending email via SendGrid HTTP API...");
    const response = await sgMail.send(msg);
    
    console.log("✅ Email sent successfully!");
    console.log("📧 Response status:", response[0].statusCode);
    console.log("📧 Message ID:", response[0].headers['x-message-id']);
    
    return { success: true, messageId: response[0].headers['x-message-id'] };
  } catch (error) {
    console.error("❌ Email sending failed!");
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error code:", error.code);
    
    if (error.response) {
      console.error("❌ SendGrid response body:", error.response.body);
      console.error("❌ SendGrid status code:", error.response.statusCode);
    }
    
    throw error; // Propagate error to controller
  }
}; 