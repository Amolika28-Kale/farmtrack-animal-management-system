
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const animalRoutes = require("./routes/animalRoutes");
const milkRoutes = require("./routes/milkRoutes");
const dietRoutes = require("./routes/dietRoutes");
const pregnancyRoutes = require("./routes/pregnancyRoutes");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/animals", animalRoutes);
app.use("/api/milk", milkRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/pregnancy", pregnancyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
