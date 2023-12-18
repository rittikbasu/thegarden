import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { text, id } = req.body;

    const { data, error } = await supabase
      .from("thegarden_notes")
      .update([{ text: text }])
      .match({ id: id });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    try {
      await res.revalidate(`/`);
      await res.revalidate(`/notes/${id}`);
    } catch (error) {
      console.log(error);
    }

    return res.status(200).json(data);
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
