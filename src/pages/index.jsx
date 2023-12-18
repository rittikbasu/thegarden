import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import Note from "@/components/Note";
import { IoIosArrowUp } from "react-icons/io";
import { formatNotes } from "@/utils/formatNotes";
import Spinner from "@/components/Spinner";
import { db } from "@/utils/db";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBackToTopBtn, setShowBackToTopBtn] = useState(false);

  const lastNoteRef = useRef(null);

  const NOTES_PER_PAGE = 20;

  const getData = async () => {
    const result = await db.notes.orderBy("created_at").reverse().toArray();
    console.log(result, result[1]);
    setNotes(formatNotes(result));
  };

  useEffect(() => {
    getData();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (notes.length === 0) {
      return;
    }
    const handleScroll = () => {
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
            className="fixed flex items-center justify-center bg-white top-8 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 rounded-full"
            title="Back to top"
          >
            <IoIosArrowUp className="w-10 h-10 p-1 fill-zinc-700" />
          </button>
        </>
      )}
      <div className="pb-12">
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
