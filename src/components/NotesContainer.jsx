import { useState, useEffect, useRef } from "react";
import Note from "@/components/Note";
import { IoIosArrowUp } from "react-icons/io";

export default function NotesContainer({ notes, scrollPositionKey }) {
  const [showBackToTopBtn, setShowBackToTopBtn] = useState(false);

  const lastNoteRef = useRef(null);

  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem(scrollPositionKey);
    if (savedScrollPosition) {
      const scroll = () => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
      };
      // Wait until the next repaint to scroll, ensuring content has loaded
      window.requestAnimationFrame(scroll);
    }

    const saveScrollPosition = () => {
      sessionStorage.setItem(scrollPositionKey, window.scrollY.toString());
    };
    window.addEventListener("scroll", saveScrollPosition);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", saveScrollPosition);
    };
  }, [notes]);

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
      </div>
    </div>
  );
}
