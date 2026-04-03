const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ MongoDB connection (FIXED)
mongoose.connect("mongodb+srv://rupalipatil66070_db_user:test46@cluster0.rcushxh.mongodb.net/sample_mflix?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB Error:", err));

// routes
app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});