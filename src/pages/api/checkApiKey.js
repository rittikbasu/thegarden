import OpenAI from "openai";

export default async function handler(req, res) {
  const { key } = req.body;

  const openai = new OpenAI({
    apiKey: key,
  });

  try {
    await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [{ role: "user", content: "Once upon a time" }],
      max_tokens: 5,
    });
    res.status(200).json({ isValid: true });
  } catch (error) {
    res.status(401).json({ isValid: false });
  }
}
