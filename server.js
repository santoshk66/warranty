const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');

const app = express();

// Load SendGrid API Key from environment
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Middleware
app.use(cors({ origin: '*' })); // Allow all origins or specify frontend domain in production
app.use(bodyParser.json());

// Health check route
app.get('/', (req, res) => {
  console.log('Health check accessed');
  res.send('✅ Warranty Email API is running!');
});

// POST route for sending warranty email
app.post('/send-warranty-email', async (req, res) => {
  const data = req.body;
  console.log('Received request:', data);

  // Validate request body
  if (!data.name || !data.email || !data.phone || !data.product || !data.device_id || !data.order_id || !data.platform || !data.purchase_date) {
    console.error('Invalid request body:', data);
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    console.error('Invalid email:', data.email);
    return res.status(400).json({ success: false, error: 'Invalid email address' });
  }
  if (!/^\d{10}$/.test(data.phone)) {
    console.error('Invalid phone number:', data.phone);
    return res.status(400).json({ success: false, error: 'Phone number must be 10 digits' });
  }

  const msg = {
    to: data.email,
    from: 'contact@maizic.com', // Must be verified in SendGrid
    subject: '🎉 Your Maizic Warranty Registration is Confirmed!',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Maizic Warranty Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #008060; text-align: center; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
              <img src="https://www.maizic.com/cdn/shop/files/maizic_logo_95x.png?v=1690012533" alt="Maizic Logo" style="max-width: 100px;">
              <h1 style="color: #ffffff; font-size: 24px; margin: 10px 0;">Warranty Registration Confirmation</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 20px;">
              <h2 style="color: #333333; font-size: 20px;">Hello ${data.name},</h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.5;">Thank you for registering your Maizic device! Your warranty has been successfully activated, including a <strong>3-month extended warranty</strong> on top of the <strong>6-month standard warranty</strong>.</p>
              <h3 style="color: #333333; font-size: 18px; margin-top: 20px;">Warranty Details</h3>
              <table role="presentation" width="100%" style="border-collapse: collapse; font-size: 16px;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #555555;"><strong>Product:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #555555;">${data.product}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #555555;"><strong>Device ID:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #555555;">${data.device_id}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #555555;"><strong>Order ID:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #555555;">${data.order_id}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #555555;"><strong>Platform:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #555555;">${data.platform}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; color: #555555;"><strong>Date of Purchase:</strong></td>
                  <td style="padding: 10px; color: #555555;">${data.purchase_date}</td>
                </tr>
              </table>
              <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-top: 20px;">Your device is now protected for a total of <strong>9 months</strong>. Keep this email for your records.</p>
              <p style="text-align: center; margin: 20px 0;">
                <a href="https://maizic.com/support" style="background-color: #008060; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Contact Support</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f4; text-align: center; padding: 15px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
              <p style="color: #777777; font-size: 14px; margin: 5px 0;">Maizic Smarthome | <a href="https://maizic.com" style="color: #008060; text-decoration: none;">maizic.com</a></p>
              <p style="color: #777777; font-size: 14px; margin: 5px 0;">
                <a href="https://twitter.com/maizicsmarthome" style="color: #008060; text-decoration: none; margin: 0 5px;">Twitter</a> |
                <a href="https://facebook.com/maizicsmarthome" style="color: #008060; text-decoration: none; margin: 0 5px;">Facebook</a> |
                <a href="https://instagram.com/maizicsmarthome" style="color: #008060; text-decoration: none; margin: 0 5px;">Instagram</a>
              </p>
              <p style="color: #777777; font-size: 12px; margin: 10px 0;">If you have any questions, contact us at <a href="mailto:support@maizic.com" style="color: #008060; text-decoration: none;">support@maizic.com</a>.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
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
