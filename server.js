const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const app = express(); // ✅ Initialize Express

const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increase limit for base64 images

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Email sending API Route - matches frontend endpoint
app.post("/send-photo-strip", async (req, res) => {
  try {
    const { recipientEmail, imageData } = req.body;

    // Validation
    if (!recipientEmail || !imageData) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields: recipientEmail and imageData are required" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email address format" 
      });
    }

    // Create HTML email with embedded image
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              background-color: #f5f5f5;
              padding: 20px;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              max-width: 600px;
              margin: 0 auto;
            }
            h1 {
              color: #333;
              margin-bottom: 20px;
            }
            img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            p {
              color: #666;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Your E-Booth Photo Strip</h1>
            <img src="${imageData}" alt="Photo Strip" />
            <p>Thank you for using E-Booth!</p>
            <p style="font-size: 12px; color: #999; margin-top: 30px;">
              This email was sent from E-Booth - Capture & Share Memories Instantly
            </p>
          </div>
        </body>
      </html>
    `;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: "Your E-Booth Photo Strip",
      text: "Your E-Booth photo strip is attached. Please view this email in an HTML-capable email client to see the image.",
      html: htmlContent,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: "Email sent successfully",
      messageId: info.messageId 
    });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to send email",
      error: error.message 
    });
  }
});

app.get("/", (req, res) => {
  res.send("E-Booth Email Backend is running");
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

