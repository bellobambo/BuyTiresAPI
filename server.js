const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Enhanced CORS configuration - Allow all origins
app.use(
  cors({
    origin: "*", // ✅ Allows requests from any origin
    credentials: false, // Set to false when using origin: '*'
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bellobambo21@gmail.com",
    pass: "wexi ugls mrrp hhgq",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Test email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Server is ready to send emails");
  }
});

app.post("/send-lead", async (req, res) => {
  console.log("Received lead request:", req.body);

  const {
    name,
    email,
    phone,
    address,
    searchType,
    vehicleInfo,
    tireSize,
    season,
  } = req.body;

  // Enhanced validation
  if (!name || !email || !phone) {
    console.log("Validation failed - missing fields:", { name, email, phone });
    return res.status(400).json({
      success: false,
      error: "Missing required fields: name, email, and phone are required",
    });
  }

  const mailOptions = {
    from: `"TireConnect Lead" <didier@mercymobile.tech>`,
    to: "didier@mercymobile.tech",
    replyTo: email,
    subject: `New Lead: ${name} (${searchType})`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">New Tire Lead Registration</h2>
        
        <h3 style="color: #333;">Customer Information</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Address:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              address || "Not provided"
            }</td>
          </tr>
        </table>

        <h3 style="color: #333;">Search Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Search Mode:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${searchType}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Vehicle Info:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${vehicleInfo}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Tire Size:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${tireSize}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Season:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${season}</td>
          </tr>
        </table>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            <strong>Lead Received:</strong> ${new Date().toLocaleString()}<br>
            <strong>Source:</strong> TireConnect Web Form
          </p>
        </div>
      </div>
    `,
    text: `New Lead Registration\n\nCustomer: ${name}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\n\nSearch Details:\nMode: ${searchType}\nVehicle: ${vehicleInfo}\nTire Size: ${tireSize}\nSeason: ${season}\n\nReceived: ${new Date().toLocaleString()}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!!:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

    res.status(200).json({
      success: true,
      message: "Lead sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({
      success: false,
      error: "Error sending email",
      details: error.message,
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "tire-lead-api",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// PASTE THIS INSTEAD:
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
  console.log(`Health check: http://127.0.0.1:${PORT}/health`);
  console.log(`✅ Emails will be sent to: didier@mercymobile.tech`);
});