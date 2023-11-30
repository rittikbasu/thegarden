import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import Note from "@/components/Note";
import { createClient } from "@supabase/supabase-js";
import { formatNotes } from "@/utils/formatNotes";

export default function Home({ data, length }) {
  const [notes, setNotes] = useState(data);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const lastNoteRef = useRef(null);

  const NOTES_PER_PAGE = 20;

  const fetchMoreNotes = async () => {
    setLoading(true);
    const startRange = notes.length;
    const endRange = startRange + NOTES_PER_PAGE - 1;
    console.log("startRange", startRange);
    console.log("endRange", endRange);
    const response = await fetch(
      `/api/fetchNotes?start=${startRange}&end=${endRange}`
    );
    const newNotes = await response.json();
    setNotes([...notes, ...newNotes]);
    setLoading(false);
  };

  useEffect(() => {
    if (notes.length >= length) {
      return;
    }

    const fetchMoreNotes = async () => {
      setLoading(true);
      const startRange = notes.length;
      const endRange = startRange + NOTES_PER_PAGE - 1;
      const response = await fetch(
        `/api/fetchNotes?start=${startRange}&end=${endRange}`
      );
      const newNotes = await response.json();
      setNotes((prevNotes) => [...prevNotes, ...newNotes]);
      setLoading(false);
    };

    const handleScroll = () => {
      if (lastNoteRef.current) {
        const rect = lastNoteRef.current.getBoundingClientRect();
        const isLastNoteVisible =
          rect.bottom <= window.innerHeight && rect.top >= 0;

        if (isLastNoteVisible) {
          console.log("Last note is visible");
          if (!loading) {
            fetchMoreNotes();
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, notes.length, length]);

  return (
    <div className="text-gray-200">
      <Head>
        <title>the garden</title>
      </Head>
      <div className="pb-8">
        {notes.map((note, index) => (
          <div
            key={note.id}
            className="relative"
            ref={index === notes.length - 1 ? lastNoteRef : null}
          >
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
        {loading && (
          <div role="status" className="flex justify-center pt-4">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-gray-200 animate-spin dark:text-zinc-800 fill-blue-500"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
  const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);
  const { data } = await supabase
    .from("thegarden_notes")
    .select("created_at, text, id")
    .order("created_at", { ascending: false })
    .range(0, 19);

  const formattedNotes = formatNotes(data);

  const { data: datesData, error: datesError } = await supabase
    .from("thegarden_notes")
    .select("created_at");

  if (datesError) throw datesError;

  const length = datesData.length;

  return {
    props: {
      data: formattedNotes,
      length,
    },
    revalidate: 1,
  };
}
