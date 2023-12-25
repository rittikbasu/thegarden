import { useState, useEffect, useRef } from "react";
import NoteCard from "@/components/NoteCard";
import { IoIosArrowUp } from "react-icons/io";

export default function NotesContainer({
  notes,
  scrollPositionKey,
  lastNoteRef,
}) {
  const [showBackToTopBtn, setShowBackToTopBtn] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (lastNoteRef.current) {
        sessionStorage.setItem(scrollPositionKey, scrollY.toString());
      }

      if (scrollY > 200) {
        setShowBackToTopBtn(true);
      } else {
        setShowBackToTopBtn(false);
      }
    };

    if (lastNoteRef.current) {
      const savedPosition = sessionStorage.getItem(scrollPositionKey);
      console.log("savedPosition", savedPosition);
      if (savedPosition) {
        console.log("scrolling to", savedPosition);
        window.scrollTo(0, parseInt(savedPosition, 10));
      }
      window.addEventListener("scroll", handleScroll);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [notes.length, scrollPositionKey, lastNoteRef]);

  return (
    <div className="text-gray-200">
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
            <NoteCard
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
