import connection from "../Config/db.js";
import ai from "../Config/gemini.js";

// Reusable MySQL query helper
const queryAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// GET ALL MESSAGES
export const getConversations = async (req, res) => {
  try {
    const sql = `
      SELECT id, content, role, created_at
      FROM messages
      ORDER BY created_at ASC, id ASC
    `;

    const results = await queryAsync(sql);

    const messages = results.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
    }));

    return res.status(200).json({
      success: true,
      data: {
        conversations: messages,
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch conversations",
    });
  }
};

// CREATE MESSAGE AND GENERATE AI RESPONSE
export const createConversation = async (req, res) => {
  try {
    console.log("POST request received");
    console.log("BODY:", req.body);

    const { question } = req.body;

    // Validate question
    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: "Question is required",
      });
    }

    const cleanQuestion = question.trim();

    // Get the latest 10 messages for AI context
    const historyRows = await queryAsync(
      `
        SELECT role, content
        FROM messages
        ORDER BY created_at DESC, id DESC
        LIMIT 10
      `,
    );

    // Reverse history to chronological order
    historyRows.reverse();

    const conversationHistory = historyRows
      .map((item) => `${item.role}: ${item.content}`)
      .join("\n");

    console.log("History loaded:", historyRows.length, "messages");

    // System instructions

    const systemPrompt = `
You are a helpful, intelligent, and conversational AI assistant
for a ChatGPT clone.

You can answer questions about any topic, including:
- Programming and software engineering
- Computer science and information technology
- Education and learning
- Science and technology
- Mathematics
- History and geography
- Language, writing, and translation
- General knowledge
- Everyday life and practical advice
- Creativity, brainstorming, and problem-solving
- Business and productivity
- Other topics the user asks about

Do not restrict your answers to programming or IT topics.

Understand the user's question and provide a relevant,
accurate, and helpful answer.

Adapt your response to the user's needs:
- Explain difficult concepts in simple language.
- Provide examples when they help understanding.
- Use step-by-step instructions for practical tasks.
- Write code when requested.
- Keep simple answers concise and provide more detail
  when the question requires it.
- If the question is unclear, ask a clarifying question.
- If you are uncertain about something, be honest
  instead of inventing information.

Respond politely and naturally.
Follow applicable safety guidelines.
`;

    // Build prompt with conversation history
    const prompt = `
${systemPrompt}

Previous conversation:
${conversationHistory || "No previous messages."}

User's new question:
${cleanQuestion}
`;

    // Generate AI response using fallback models
    let answer;
    const modelsToTry = [
      ...new Set(
        [process.env.GEMINI_MODEL, "gemini-3.8-flash"].filter(Boolean),
      ),
    ];

    let lastError;

    try {
      for (const model of modelsToTry) {
        try {
          console.log(`Trying Gemini model: ${model}`);

          const response = await ai.models.generateContent({
            model,
            contents: prompt,
          });

          answer = response.text;

          if (!answer || !answer.trim()) {
            throw new Error("Gemini returned an empty response");
          }

          console.log(`Gemini response generated with: ${model}`);
          break;
        } catch (error) {
          lastError = error;

          console.error(
            `Gemini model ${model} failed:`,
            error.status || error.message,
          );

          const status = error.status;

          // Try another model only for temporary errors
          if (status !== 429 && status !== 503 && !(status >= 500)) {
            throw error;
          }
        }
      }

      // If every model fails, return an error
      if (!answer || !answer.trim()) {
        throw lastError || new Error("All Gemini models failed");
      }
    } catch (error) {
      console.error("Gemini API error:", error);

      const statusCode =
        error.status === 503 || error.status === 429 ? 503 : 500;

      const errorMessage =
        error.status === 503
          ? "AI service is temporarily busy. Please try again shortly."
          : error.status === 429
            ? "AI request limit reached. Please try again later."
            : "Failed to generate an AI response.";

      return res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }

    // Save the user message
    const userResult = await queryAsync(
      `
        INSERT INTO messages (role, content)
        VALUES (?, ?)
      `,
      ["user", cleanQuestion],
    );

    // Save the assistant response
    const assistantResult = await queryAsync(
      `
        INSERT INTO messages (role, content)
        VALUES (?, ?)
      `,
      ["assistant", answer],
    );

    console.log("User and assistant messages saved successfully");

    // Return both messages to the frontend
    return res.status(201).json({
      success: true,
      data: {
        userConversation: {
          id: userResult.insertId,
          role: "user",
          content: cleanQuestion,
        },
        assistantConversation: {
          id: assistantResult.insertId,
          role: "assistant",
          content: answer,
        },
      },
    });
  } catch (error) {
    console.error("Error creating conversation:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to process your message. Please try again.",
    });
  }
};
