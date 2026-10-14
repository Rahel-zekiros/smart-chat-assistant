
import express from "express";
import {
  getConversations,
  // getConversationMessages,
  createConversation,
} from "../Controllers/ChatController.js";

const router = express.Router();

router.get("/conversations", getConversations);

// router.get(
//   "/conversations/:conversationId/messages",
//   getConversationMessages
// );

router.post("/conversations", createConversation);

export default router;
