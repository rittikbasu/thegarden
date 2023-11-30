import { createClient } from "@supabase/supabase-js";
import { formatNotes } from "@/utils/formatNotes";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

export default async function fetchPosts(req, res) {
  const { start, end } = req.query;

  const rangeStart = parseInt(start, 10);
  const rangeEnd = parseInt(end, 10);

  const { data, error } = await supabase
    .from("thegarden_notes")
    .select("*")
    .order("created_at", { ascending: false })
    .range(rangeStart, rangeEnd);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const formattedData = formatNotes(data);

  res.status(200).json(formattedData);
}
