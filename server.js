const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables from .env file
const userRoutes = require("./routes/user");
const skillsRoutes = require("./routes/skills");
const cors = require("cors");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/skills", skillsRoutes);

mongoose
  .connect(process.env.MONGO_URI_SKILLSWAP, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB...");
    app.listen(PORT, () => {
      console.log(`Server listening at PORT ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
