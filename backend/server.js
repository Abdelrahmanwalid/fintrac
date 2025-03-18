const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/categoryRoutes");
const itemRoutes = require("./routes/itemRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const cookieParser = require("cookie-parser");

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/income", incomeRoutes); // Ensure this is present

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
