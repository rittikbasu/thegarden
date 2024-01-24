import { db } from "./db";

export const initializeSettings = async () => {
  const systemPromptExists = await db.settings
    .where("name")
    .equals("systemPrompt")
    .first();

  if (!systemPromptExists) {
    const systemPrompt =
      "You are a personal knowledge base that has access to me, the user's journal entries. You will always address me in the first person. Your task is to analyze the journal entries provided and answer only based on the relevant information. You can respond in simple markdown using ordered or unordered lists in a structured, easy to read and concise format with no additional fluff. If no relevant information is found, respond with 'no results found' in lowercase.";
    await db.settings.bulkPut([
      { name: "systemPrompt", text: systemPrompt, status: true },
      { name: "openaiApiKey", text: "", status: false },
    ]);
  }
};
