import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { HiArrowLongLeft } from "react-icons/hi2";
import Link from "next/link";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

export default function NotePage({ note = { text: "" }, previousPath }) {
  const [text, setText] = useState(note.text);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(note.text);

  const handleEdit = () => setIsEditing(true);

  const handleTextChange = (event) => setEditedNote(event.target.value);

  function handleTextAreaFocus(event) {
    const val = event.target.value;
    event.target.value = "";
    event.target.value = val;
  }

  async function handleSave() {
    if (text !== editedNote) {
      try {
        const response = await fetch("/api/updateNote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: note.id,
            text: editedNote,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        setIsEditing(false);
        setText(editedNote);
      } catch (error) {
        console.error("Failed to send note to API:", error);
      }
    } else {
      setIsEditing(false);
    }
  }

  const linkPath =
    previousPath && ["/search", "/", "/reflect"].includes(previousPath)
      ? previousPath
      : "/";
  return (
    <div className="flex flex-col h-screen pb-4">
      <div className="flex items-center justify-between gap-x-4 pt-8 pb-2">
        <Link href={linkPath} passHref>
          <div className="text-orange-500 flex items-center justify-center">
            <div className="flex items-center justify-center">
              <HiArrowLongLeft className="w-6 h-6 mr-2" />
              <span>back</span>
            </div>
          </div>
        </Link>
        {isEditing ? (
          <button className="text-blue-400" onClick={handleSave}>
            {text === editedNote ? "done" : "save"}
          </button>
        ) : (
          <button className="text-blue-400" onClick={handleEdit}>
            edit
          </button>
        )}
      </div>
      <div className="flex items-center text-sm text-zinc-400 justify-between pt-8 pb-4 mx-2">
        <p>{note && note.date ? note.date.toLowerCase() : ""}</p>
        <p>{note && note.time ? note.time.toLowerCase() : ""}</p>
      </div>
      {!isEditing ? (
        <>
          <div
            className="flex-grow focus:outline-none tracking-widest font-workSans text-zinc-100 p-4 overflow-y-scroll font-light bg-zinc-900/80 border border-zinc-800/60 rounded-2xl"
            placeholder="what's are you thinking?"
            style={{ wordSpacing: "0.2em" }}
          >
            {text}
          </div>
          <div className="flex justify-end pr-2 pt-2">
            <button className="text-red-500">delete</button>
          </div>
        </>
      ) : (
        <textarea
          value={editedNote}
          onChange={handleTextChange}
          onFocus={handleTextAreaFocus}
          autoFocus
          className="flex-grow focus:outline-none tracking-widest font-workSans text-zinc-100 p-4 overflow-y-scroll font-light bg-zinc-900/80 border border-zinc-800/60 rounded-2xl"
          placeholder="what's are you thinking?"
          style={{ wordSpacing: "0.2em" }}
        ></textarea>
      )}
    </div>
  );
}

export const getStaticPaths = async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);
  const { data, error } = await supabase.from("thegarden_notes").select("id");
  return {
    paths: data.map((note) => ({
      params: {
        slug: note.id.toString(),
      },
    })),
    fallback: true,
  };
};

export const getStaticProps = async (context) => {
  const { slug } = context.params;
  const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);
  const { data, error } = await supabase
    .from("thegarden_notes")
    .select("*")
    .eq("id", slug);

  if (error) {
    console.error("Error fetching journal data:", error);
    return {
      props: {
        note: [],
      },
    };
  }

  const timestamp = new Date(data[0].created_at);
  data[0].date = timestamp.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  data[0].time = timestamp.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return {
    props: {
      note: data[0],
    },
  };
};
