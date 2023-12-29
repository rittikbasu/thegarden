import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req) {
  const { prompt } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    stream: true,
    messages: prompt.messages,
    // max_tokens: 100,
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}
