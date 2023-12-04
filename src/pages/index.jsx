import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import Note from "@/components/Note";
import { createClient } from "@supabase/supabase-js";
import { IoIosArrowUp } from "react-icons/io";
import { formatNotes } from "@/utils/formatNotes";
import Spinner from "@/components/Spinner";

export default function Home({ data, length }) {
  const [notes, setNotes] = useState(data);
  const [loading, setLoading] = useState(false);
  const [showBackToTopBtn, setShowBackToTopBtn] = useState(false);

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (notes.length >= length) {
      return;
    }
    const handleScroll = () => {
      if (lastNoteRef.current) {
        const rect = lastNoteRef.current.getBoundingClientRect();
        const isLastNoteVisible =
          rect.bottom <= window.innerHeight && rect.top >= 0;

        if (isLastNoteVisible) {
          if (!loading) {
            fetchMoreNotes();
          }
        }
      }

      if (window.scrollY > 300) {
        setShowBackToTopBtn(true);
      } else {
        setShowBackToTopBtn(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  return (
    <div className="text-gray-200">
      <Head>
        <title>the garden</title>
      </Head>
      {showBackToTopBtn && (
        <>
          <button
            onClick={scrollToTop}
            className="fixed lg:hidden bottom-4 right-8 z-10 text-blue-500 border border-blue-500 backdrop-blur-sm font-bold py-2 px-4 rounded-full"
            title="Back to top"
          >
            ↑
          </button>
          <button
            onClick={scrollToTop}
            className="hidden lg:block fixed bottom-10 md:right-1/4 xl:right-1/3 transform translate-x-1/2 max-w-lg z-10 text-blue-500 border border-blue-500 backdrop-blur-sm font-bold py-1.5 px-4 rounded-xl"
            title="Back to top"
          >
            <IoIosArrowUp className="inline-block w-4 h-4 mr-0.5" /> top
          </button>
        </>
      )}
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
          <Spinner
            containerClassName="flex justify-center pt-4"
            svgClassName="w-8 h-8 fill-blue-500"
          />
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
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
  };
}
