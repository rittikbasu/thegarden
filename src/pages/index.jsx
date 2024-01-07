import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Confetti from "react-confetti";

import NotesContainer from "@/components/NotesContainer";
import ContributionGraph from "@/components/ContributionGraph";
import { formatNotes } from "@/utils/formatNotes";
import { db } from "@/utils/db";

export default function Home() {
  const router = useRouter();
  const { timestamp } = router.query;
  const [notes, setNotes] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const lastNoteRef = useRef(null);

  const getData = async () => {
    const result = await db.notes.orderBy("created_at").reverse().toArray();
    setNotes(formatNotes(result));
  };

  useEffect(() => {
    getData();
    setWindowHeight(window.innerHeight);
    setWindowWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    function compareTimestampToNow() {
      const decodedTimestamp = decodeURIComponent(timestamp);
      const confettiTimestamp = new Date(decodedTimestamp).getTime();
      const currentTimestamp = new Date().getTime();
      const timeDiff = Math.abs(currentTimestamp - confettiTimestamp);
      if (timeDiff <= 10 * 1000) {
        setShowConfetti(true);
      }
    }
    timestamp && compareTimestampToNow();
  }, [timestamp]);

  useEffect(() => {
    let scrollTimeout;
    if (showConfetti) {
      document.body.style.overflow = "hidden";

      scrollTimeout = setTimeout(() => {
        document.body.style.overflow = "auto";
      }, 2000);
    }

    return () => {
      clearTimeout(scrollTimeout);
      document.body.style.overflow = "auto";
    };
  }, [showConfetti]);
  return (
    <div className="text-gray-200">
      <Head>
        <title>the garden</title>
      </Head>

      {showConfetti && (
        <Confetti
          recycle={false}
          height={windowHeight}
          width={windowWidth}
          numberOfPieces={300}
          confettiSource={{
            x: windowWidth / 2,
            y: windowHeight,
            w: 0,
            h: 0,
          }}
          initialVelocityY={{ min: 0, max: -25 }}
        />
      )}

      <div className="pb-12">
        <ContributionGraph />
        <NotesContainer
          notes={notes}
          scrollPositionKey={"homeScrollPosition"}
          lastNoteRef={lastNoteRef}
        />
      </div>
    </div>
  );
}
