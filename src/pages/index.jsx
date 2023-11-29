import Head from "next/head";
import clsx from "clsx";
import Note from "@/components/Note";
import { createClient } from "@supabase/supabase-js";

export default function Home({ notes }) {
  return (
    <div className="h-screen text-gray-200">
      <Head>
        <title>the garden</title>
      </Head>
      <div className="pb-8">
        {notes.map((note, index) => (
          <div key={note.id} className="relative">
            <Note
              id={note.id}
              date={note.date}
              time={note.time}
              content={note.text}
              index={index}
              length={notes.length - 1}
              prevDate={index > 0 ? notes[index - 1].date : null}
              nextDate={index < notes.length - 1 ? notes[index + 1].date : null}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
  const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);
  const { data, error } = await supabase.from("thegarden_notes").select("*");

  if (error) {
    console.error("Error fetching journal data:", error);
    return {
      props: {
        notes: [],
      },
    };
  }
  data.forEach((entry) => {
    const timestamp = new Date(entry.created_at);
    entry.date = timestamp.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    entry.time = timestamp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    entry.text = entry.text.split(" ").slice(0, 50).join(" ");
  });
  return {
    props: {
      notes: data,
    },
  };
}
