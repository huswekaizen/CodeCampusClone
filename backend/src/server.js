import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose"; // <-- import mongoose
import activityRoutes from "./routes/activityRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";

import path from "path";
import { fileURLToPath } from "url";

import "./models/User.js";
import "./models/Course.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());

// Increase JSON and URL-encoded body limits for text-based requests
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) return next(); // skip JSON parser for file uploads
  express.json({ limit: '10mb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files correctly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ----- Connect to MongoDB -----
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1); // stop server if DB fails
});

// ----- Routes -----
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", activityRoutes);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
