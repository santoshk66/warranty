const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');

const app = express();

// Load SendGrid API Key from environment
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Middleware
app.use(cors({ origin: '*' })); // Allow all origins or specify frontend domain
app.use(bodyParser.json());

// Health check route
app.get('/', (req, res) => {
  console.log('Health check accessed');
  res.send('✅ Warranty Email API is running!');
});

// POST route for sending warranty email
app.post('/send-warranty-email', async (req, res) => {
  const data = req.body;

  // Validate request body
  if (!data.email || !data.name || !data.product || !data.device_id || !data.order_id || !data.platform || !data.purchase_date) {
    console.error('Invalid request body:', data);
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const msg = {
    to: data.email,
    from: 'contact@maizic.com', // Must be verified in SendGrid
    subject: '🎉 Your Maizic Warranty Has Been Registered!',
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
    console.log('Email sent successfully to:', data.email);
    res.json({ success: true });
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.body?.errors?.[0]?.message || error.message
    });
  }
});

// Bind to Render-assigned port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Warranty email server running on port ${port}`);
});
