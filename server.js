require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Resend } = require("resend");

const app = express();

// Enhanced CORS configuration - Keep your existing settings
app.use(
  cors({
    origin: "*",
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware - Keep this
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Initialize Resend (Free 3000 emails/month)
const resend = new Resend(process.env.RESEND_API_KEY);

// Store leads in memory
let leads = [];

// Verify Resend connection
console.log("📧 Resend API initialized");
if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️ RESEND_API_KEY environment variable not set!");
  console.log("📝 Leads will be saved locally but emails won't be sent");
}

app.post("/send-lead", async (req, res) => {
  console.log("📥 Received lead request:", req.body);

  const {
    name,
    email,
    phone,
    address,
    searchType,
    vehicleInfo,
    tireSize,
    season,
    frontTireSize,
    rearTireSize,
    speedRating,
    loadIndex,
  } = req.body;

  // Enhanced validation - Keep your validation
  if (!name || !email || !phone) {
    console.log("❌ Validation failed - missing fields:", {
      name,
      email,
      phone,
    });
    return res.status(400).json({
      success: false,
      error: "Missing required fields: name, email, and phone are required",
    });
  }

  const lead = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...req.body,
  };

  // Always save lead locally
  leads.push(lead);
  if (leads.length > 100) leads = leads.slice(-100);

  console.log("📝 Lead saved locally with ID:", lead.id);

  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Send email using Resend API
    const { data, error } = await resend.emails.send({
      from: "TireConnect <didier@mercymobile.tech>", // Will use your verified domain later
      to: ["didier@mercymobile.tech"],
      replyTo: email,
      subject: ` New Tire Lead: ${name} (${searchType})`,
      html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">New Tire Lead Registration</h2>
    
    <h3 style="color: #333;">Customer Information</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Name:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Email:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Phone:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Address:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${
          address || "Not provided"
        }</td>
      </tr>
    </table>

    <h3 style="color: #333;">Search Details</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Search Mode:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${searchType}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Vehicle Info:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${vehicleInfo}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Tire Size:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${tireSize}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Season:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${season}</td>
      </tr>
      ${
        searchType === "By Tire Size" && frontTireSize
          ? `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Front Tire:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${frontTireSize}</td>
      </tr>
      `
          : ""
      }
      ${
        searchType === "By Tire Size" && rearTireSize
          ? `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Rear Tire:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${rearTireSize}</td>
      </tr>
      `
          : ""
      }
      ${
        searchType === "By Tire Size" && speedRating
          ? `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Speed Rating:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${speedRating}</td>
      </tr>
      `
          : ""
      }
      ${
        searchType === "By Tire Size" && loadIndex
          ? `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Load Index:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${loadIndex}</td>
      </tr>
      `
          : ""
      }
    </table>
    
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
      <p style="margin: 0; color: #666; font-size: 12px;">
        <strong>Lead Received:</strong> ${new Date().toLocaleString()}<br>
        <strong>Source:</strong> TireConnect Web Form<br>
        <strong>Lead ID:</strong> ${lead.id}
      </p>
    </div>
  </div>
`,
      text: `New Tire Lead\n\nCustomer: ${name}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${
        address || "Not provided"
      }\n\nSearch Details:\nMode: ${searchType}\nVehicle: ${vehicleInfo}\nTire Size: ${tireSize}\nSeason: ${season}\n\nReceived: ${new Date().toLocaleString()}\nLead ID: ${
        lead.id
      }`,
    });

    if (error) throw error;

    console.log("✅ Email sent successfully via Resend API! ID:", data.id);

    res.status(200).json({
      success: true,
      message: "Lead sent successfully",
      leadId: lead.id,
      emailId: data.id,
    });
  } catch (error) {
    console.error("❌ Email sending error:", error.message);

    // Still return success (lead is saved locally)
    res.status(200).json({
      success: true,
      message: "Lead received successfully (saved locally)",
      note: "Email notification failed",
      leadId: lead.id,
      error: error.message,
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "tire-lead-api",
    environment: process.env.NODE_ENV || "development",
    leadsCount: leads.length,
    resendConfigured: !!process.env.RESEND_API_KEY,
    port: process.env.PORT || 3000,
  });
});

// View recent leads
app.get("/leads", (req, res) => {
  res.json({
    count: leads.length,
    leads: leads.slice(-20).reverse(),
  });
});

// Test endpoint
app.get("/test-email", async (req, res) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      return res.status(400).json({
        success: false,
        error: "RESEND_API_KEY not configured in environment variables",
      });
    }

    const { data, error } = await resend.emails.send({
      from: "TireConnect <didier@mercymobile.tech>",
      to: ["didier@mercymobile.tech"],
      subject: "Test Email from TireConnect API",
      html: "<p>This is a test email from your TireConnect API!</p>",
      text: "Test email from TireConnect API",
    });

    if (error) throw error;

    res.json({
      success: true,
      message: "Test email sent successfully",
      emailId: data.id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    service: "TireConnect Lead API",
    version: "2.0.0",
    status: "running",
    endpoints: {
      sendLead: "POST /send-lead",
      health: "GET /health",
      testEmail: "GET /test-email",
      viewLeads: "GET /leads",
    },
    note: "Using Resend API for email delivery",
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔍 Health check: /health`);
  console.log(`📧 Test email: /test-email`);
  console.log(`📝 View leads: /leads`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);

  if (process.env.RESEND_API_KEY) {
    console.log("✅ Resend API: Configured");
  } else {
    console.log(
      "⚠️ Resend API: Not configured - set RESEND_API_KEY environment variable"
    );
  }
});
