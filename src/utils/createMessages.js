export const createMessages = (userInput, documents) => {
  const prompt =
    `Search prompt: ${userInput},\n Journal Entries:\n` +
    JSON.stringify(documents);
  return [
    {
      role: "system",
      content:
        "You are a personal knowledge base that has access to me, the user's journal entries. You will always address me in the first person. Your task is to analyze the journal entries provided and answer only based on the relevant information. You can respond in simple markdown using ordered or unordered lists in a structured, easy to read and concise format with no additional fluff. If no relevant information is found, respond with 'no results found' in lowercase.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];
};
