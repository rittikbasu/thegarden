import { createClient } from "@supabase/supabase-js";
import Dexie from "dexie";
import { formatNotes } from "./formatNotes";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_API_KEY = process.env.NEXT_PUBLIC_SUPABASE_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);
export const db = new Dexie("thegarden");
db.version(2).stores({
  notes: "id, created_at, text, images, operation, sync",
});
// Hook into the 'creating' event to set default values for new records
db.notes.hook("creating", function (primaryKey, obj, transaction) {
  obj.sync = "false";
  obj.operation = "create";
});

// db.transaction("rw", db.notes, async () => {
//   await db.notes
//     .where("operation")
//     .equals("create")
//     .modify((note) => {
//       note.sync = "false";
//     });
// });

// Function to fetch data from Supabase and store it in IndexedDB
export async function fetchAndStoreData() {
  const { data: supabaseData, error } = await supabase
    .from("thegarden_notes")
    .select("id, created_at, text, images");

  if (error) {
    console.error("Error fetching data from Supabase:", error);
    return;
  }

  // Add 'upload' and 'sync' properties to each item with a default value of true
  const dataWithDefaults = supabaseData.map((item) => ({
    ...item,
    sync: false,
    operation: "create",
  }));

  // Store data in IndexedDB
  try {
    await db.notes.bulkPut(dataWithDefaults);
    console.log(
      "Data stored in IndexedDB with 'upload' and 'sync' set to true"
    );
  } catch (dexieError) {
    console.error("Error storing data in IndexedDB:", dexieError);
  }
}

export async function fetchAllData() {
  const result = await db.notes
    .orderBy("created_at")
    .reverse()
    // .limit(NOTES_PER_PAGE)
    .toArray();
  console.log(result);
  return formatNotes(result);
}

// fetch data from a particular id
export async function fetchNoteData(id) {
  const result = await db.notes.get(id);
  console.log(result);
  return result;
}
