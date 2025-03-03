import dotenv from "dotenv";
dotenv.config();

import { MongoClient, ServerApiVersion } from "mongodb";
import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI (use MongoDB Atlas URI in production)
const uri = process.env.MONGO_URI || "mongodb://localhost:27017/";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

// Define routes
app.get("/", (req, res) => {
  res.send("Hello to the server of studio");
});

app.post("/check", async (req, res) => {
  try {
    const { studio, date, time } = req.body;

    if (!studio || !date || !time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const StudioBooking = client.db("StudioBooking");
    const bookings = StudioBooking.collection("bookings");

    const result = await bookings.findOne({
      studio: studio,
      date: date,
      time: time,
    });

    // If a match is found, return 'false', otherwise 'true'
    if (result) {
      return res.json("false");
    } else {
      return res.json("true");
    }
  } catch (error) {
    console.error("❌ Error in /check API:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /addBooking - Add a new booking to the DB
app.post("/addBooking", async (req, res) => {
  const booking = req.body;

  const StudioBooking = client.db("StudioBooking");
  const bookings = StudioBooking.collection("bookings");

  const result = await bookings.insertOne(booking);

  res.send(result);
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

// Ping MongoDB to check connection
connectDB().then(() => {
  client
    .db("admin")
    .command({ ping: 1 })
    .then(() => {
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
      );
    })
    .catch((err) => console.error("Ping failed:", err));
});
