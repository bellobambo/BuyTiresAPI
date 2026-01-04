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

// **UPDATED: Fixed SMTP Configuration**
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || "bellobambo21@gmail.com",
    pass: process.env.SMTP_PASS || "wexi ugls mrrp hhgq",
  },
  connectionTimeout: 30000, // Increased to 30 seconds
  greetingTimeout: 30000,
  socketTimeout: 30000,
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  debug: true, // Enable debug output
  logger: true  // Enable logger
});

// Test email configuration with better logging
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error Details:", {
      message: error.message,
      code: error.code,
      command: error.command
    });
    
    // Try alternative configuration if first fails
    console.log("Trying alternative SMTP configuration...");
    createAlternativeTransporter();
  } else {
    console.log("✅ SMTP Server is ready to send emails");
    console.log(`📧 Using: ${transporter.options.auth.user}`);
    console.log(`🔗 Host: ${transporter.options.host}:${transporter.options.port}`);
  }
});

// Alternative transporter as backup
function createAlternativeTransporter() {
  // Try port 465 with SSL
  const altTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || "bellobambo21@gmail.com",
      pass: process.env.SMTP_PASS || "wexi ugls mrrp hhgq",
    },
    connectionTimeout: 30000,
    tls: {
      rejectUnauthorized: false
    }
  });
  
  altTransporter.verify((error, success) => {
    if (error) {
      console.error("❌ Alternative SMTP also failed:", error.message);
    } else {
      console.log("✅ Alternative SMTP (port 465) is ready");
      // You could set this as the main transporter here
    }
  });
  
  return altTransporter;
}

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
    from: `"TireConnect Lead" <${process.env.SMTP_USER || "bellobambo21@gmail.com"}>`,
    to: "didier@mercymobile.tech",
    replyTo: email,
    subject: `New Tire Lead: ${name} (${searchType})`,
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
            <strong>Source:</strong> TireConnect Web Form<br>
            <strong>Server:</strong> ${process.env.NODE_ENV || 'development'}
          </p>
        </div>
      </div>
    `,
    text: `New Lead Registration\n\nCustomer: ${name}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\n\nSearch Details:\nMode: ${searchType}\nVehicle: ${vehicleInfo}\nTire Size: ${tireSize}\nSeason: ${season}\n\nReceived: ${new Date().toLocaleString()}`,
  };

  try {
    console.log("Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully! Message ID:", info.messageId);
    console.log("📧 To:", mailOptions.to);
    
    // Log success to console for backup
    console.log("📝 LEAD SENT SUCCESSFULLY:", {
      name,
      email,
      phone,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: "Lead sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("❌ Email sending error:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // **CRITICAL: Log lead to console as backup**
    console.log("📝 LEAD RECEIVED (BACKUP - EMAIL FAILED):", JSON.stringify({
      ...req.body,
      receivedAt: new Date().toISOString(),
      server: process.env.NODE_ENV || 'development'
    }, null, 2));
    
    // Still return success to user but indicate email failed
    res.status(200).json({
      success: true,
      message: "Lead received successfully (logged internally)",
      note: "Email notification may be delayed",
      receivedAt: new Date().toISOString()
    });
  }
});

// Health check endpoint with SMTP status
app.get("/health", (req, res) => {
  const healthStatus = {
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "tire-lead-api",
    environment: process.env.NODE_ENV || 'development',
    smtpConfigured: !!(process.env.SMTP_USER || transporter.options.auth.user),
    port: process.env.PORT || 3000
  };
  
  // Test SMTP connection
  transporter.verify((error, success) => {
    healthStatus.smtpStatus = error ? "error" : "ready";
    healthStatus.smtpError = error ? error.message : null;
    
    res.status(200).json(healthStatus);
  });
});

// Simple test endpoint
app.get("/test-email", async (req, res) => {
  try {
    const testMailOptions = {
      from: process.env.SMTP_USER || "bellobambo21@gmail.com",
      to: "didier@mercymobile.tech",
      subject: "Test Email from TireConnect API",
      text: `Test email sent at ${new Date().toISOString()}`,
      html: `<p>Test email sent at ${new Date().toISOString()}</p>`
    };
    
    const info = await transporter.sendMail(testMailOptions);
    res.json({
      success: true,
      message: "Test email sent",
      messageId: info.messageId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    service: "TireConnect Lead API",
    version: "1.0.0",
    endpoints: {
      sendLead: "POST /send-lead",
      health: "GET /health",
      testEmail: "GET /test-email"
    },
    status: "running"
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

// This tells the app to use Render's port, or 3000 if running locally
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔍 Health check: /health`);
  console.log(`📧 Test email: /test-email`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 SMTP User: ${process.env.SMTP_USER || 'bellobambo21@gmail.com'}`);
  
  // Log configuration
  console.log("\n📋 Configuration:");
  console.log(`- Port: ${PORT}`);
  console.log(`- SMTP Host: ${transporter.options.host}`);
  console.log(`- SMTP Port: ${transporter.options.port}`);
  console.log(`- SMTP Secure: ${transporter.options.secure}`);
});