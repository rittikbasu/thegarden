import Dexie from "dexie";

export const db = new Dexie("thegarden");
db.version(6).stores({
  notes: "id, created_at, text, images, operation, sync",
  reflections: "type, date, text",
});

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
// export async function fetchAndStoreData() {
//   const { data: supabaseData, error } = await supabase
//     .from("thegarden_notes")
//     .select("id, created_at, text, images");

//   if (error) {
//     console.error("Error fetching data from Supabase:", error);
//     return;
//   }

//   const dataWithDefaults = supabaseData.map((item) => ({
//     ...item,
//     sync: false,
//     operation: "create",
//   }));

//   try {
//     await db.notes.bulkPut(dataWithDefaults);
//     console.log(
//       "Data stored in IndexedDB with 'upload' and 'sync' set to true"
//     );
//   } catch (dexieError) {
//     console.error("Error storing data in IndexedDB:", dexieError);
//   }
// }
