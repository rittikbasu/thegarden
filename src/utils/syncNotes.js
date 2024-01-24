import { db } from "./db";
import { VectorStorage } from "vector-storage";
import { getFormattedDate } from "@/utils/formatNotes";

export const syncNotes = async () => {
  const unsyncedNotes = await db.notes.where("sync").equals("false").toArray();
  if (unsyncedNotes.length === 0) return;
  console.log(unsyncedNotes);
  const texts = unsyncedNotes.map((note) => {
    const formattedDate = getFormattedDate(note.created_at);
    return `Date: ${formattedDate}\n${note.text}`;
  });
  console.log(texts);
  const metadatas = unsyncedNotes.map((note) => ({
    id: note.id,
    createdAt: note.created_at,
  }));
  console.log(metadatas);

  try {
    const vectorStore = new VectorStorage({
      openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
    const response = await vectorStore.addTexts(texts, metadatas);
    console.log(response);
    const updatePromises = unsyncedNotes.map((note) =>
      db.notes.update(note.id, { sync: "true" })
    );
    await Promise.all(updatePromises);
  } catch (error) {
    console.error(error);
  }
};
