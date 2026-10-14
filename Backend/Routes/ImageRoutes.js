
import express from "express";
import { generateImage } from "../Controllers/ImageController.js";

const router = express.Router();

router.post("/generate", generateImage);

export default router;
