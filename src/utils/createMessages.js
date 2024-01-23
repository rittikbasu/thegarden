import { db } from "./db";

export const createMessages = async (userInput, documents) => {
  const systemPrompt = await db.settings.get("systemPrompt");
  const prompt =
    `Search prompt: ${userInput},\n Journal Entries:\n` +
    JSON.stringify(documents);
  return [
    {
      role: "system",
      content: systemPrompt.text,
    },
    {
      role: "user",
      content: prompt,
    },
  ];
};
