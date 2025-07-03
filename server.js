const express = require("express");
const bodyParser = require("body-parser");
const sgMail = require("@sendgrid/mail");

const app = express();

// ✅ Load SendGrid API Key from Render environment
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Middleware
app.use(bodyParser.json());

// Health check route (optional)
app.get("/", (req, res) => {
  res.send("✅ Warranty Email API is running!");
});

// POST route for sending warranty email
app.post("/send-warranty-email", async (req, res) => {
  const data = req.body;

  const msg = {
    to: data.email,
    from: "contact@maizic.com", // ✅ Replace with your verified SendGrid sender
    subject: "🎉 Your Maizic Warranty Has Been Registered!",
    html: `
      <h2>Hello ${data.name},</h2>
      <p>Thank you for registering your Maizic device!</p>
      <p><strong>Product:</strong> ${data.product}</p>
      <p><strong>Device ID:</strong> ${data.device_id}</p>
      <p><strong>Order ID:</strong> ${data.order_id}</p>
      <p><strong>Platform:</strong> ${data.platform}</p>
      <p><strong>Date of Purchase:</strong> ${data.purchase_date}</p>
      <br>
      <p>🛡️ You've received 3 months extended warranty (in addition to 6 months standard warranty).</p>
    `
  };

  try {
    await sgMail.send(msg);
    res.json({ success: true });
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.body || error.message
    });
  }
});

// ✅ Bind to Render-assigned port ONLY
app.listen(process.env.PORT, () => {
  console.log(`✅ Warranty email server running on port ${process.env.PORT}`);
});
