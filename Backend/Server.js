import express from "express";
import cors from 'cors';
import "./Config/db.js";
import chatRoutes from "./Routes/ChatRoutes.js";
import imageRoutes from "./Routes/ImageRoutes.js";
import authRoutes from "./user-registration/routes/authRoutes.js";

const app = express();
app.use(cors());
// Middleware
app.use(express.json());

// Routes
app.use("/api/chat", chatRoutes);
// image route
app.use("/api/images", imageRoutes);
// auth route
app.use("/api/auth", authRoutes);
// Server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});