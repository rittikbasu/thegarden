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
