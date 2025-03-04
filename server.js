const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

const app = express(); // ✅ Initialize Express
const PORT = process.env.PORT || 3002;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Schema and Model
const CounterSchema = new mongoose.Schema({
  pageviews: Number,
  visits: Number,
});

const Counter = mongoose.model("Counter", CounterSchema);

// API Route
app.get("/api", async (req, res) => {
  try {
    let counter = await Counter.findOne();

    if (!counter) {
      counter = new Counter({ pageviews: 0, visits: 0 });
    }

    counter.pageviews += 1;
    if (req.query.type === "visit-pageview") {
      counter.visits += 1;
    }

    await counter.save();
    res.json(counter);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.send("E-Booth Counter Backend is running");
})

// Start the Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
