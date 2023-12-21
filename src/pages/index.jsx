import Head from "next/head";
import { useState, useEffect } from "react";
import NotesContainer from "@/components/NotesContainer";
import { formatNotes } from "@/utils/formatNotes";
import { db } from "@/utils/db";

export default function Home() {
  const [notes, setNotes] = useState([]);

  const getData = async () => {
    const result = await db.notes.orderBy("created_at").reverse().toArray();
    console.log(result, result[1]);
    setNotes(formatNotes(result));
  };

  useEffect(() => {
    getData();
  }, []);
  return (
    <div className="text-gray-200">
      <Head>
        <title>the garden</title>
      </Head>
      <div className="pb-12">
        <NotesContainer
          notes={notes}
          scrollPositionKey={"homeScrollPosition"}
        />
      </div>
    </div>
  );
}
