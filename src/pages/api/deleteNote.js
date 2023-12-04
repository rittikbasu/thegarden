import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { id } = req.body;
    console.log("id", id);

    const { data, error } = await supabase
      .from("thegarden_notes")
      .delete()
      .eq("id", id);

    if (error) {
      res
        .status(500)
        .json({ error: "An error occurred while deleting the entry" });
    } else {
      res.status(200).json({ message: "Entry deleted successfully" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
