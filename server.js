const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3002;

// Configure CORS to accept requests from localhost:3000
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allows sending cookies or authentication headers
  })
);

// Root Route (Move it Above /api for Proper Routing)
app.get("/", (req, res) => {
  res.send("E-Booth Counter Backend is running");
});

app.get("/api", (req, res) => {
  if (req.url === "/favicon.ico") {
    return res.status(204).end(); // No content response for favicon.ico
  }

  try {
    const json = fs.readFileSync("count.json", "utf-8");
    const obj = JSON.parse(json);

    obj.pageviews += 1;
    if (req.query.type === "visit-pageview") {
      obj.visits += 1;
    }

    fs.writeFileSync("count.json", JSON.stringify(obj));

    res.json(obj);
  } catch (error) {
    console.error("Error reading or writing file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
