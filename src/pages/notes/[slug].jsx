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
  const [saving, setSaving] = useState(false);

  const handleEdit = () => setIsEditing(true);

  const handleTextChange = (event) => setEditedNote(event.target.value);

  function handleTextAreaFocus(event) {
    const val = event.target.value;
    event.target.value = "";
    event.target.value = val;
  }

  async function handleSave() {
    if (text !== editedNote) {
      setSaving(true);
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
        setSaving(false);
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
          !saving ? (
            <button className="text-blue-400" onClick={handleSave}>
              {text === editedNote ? "done" : "save"}
            </button>
          ) : (
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-6 h-6 text-gray-200 animate-spin dark:text-zinc-800 fill-blue-500"
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
          )
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
            className="flex-grow focus:outline-none tracking-widest font-workSans text-zinc-100 p-4 overflow-y-scroll font-light break-words whitespace-pre-wrap bg-zinc-900/80 border border-zinc-800/60 rounded-2xl"
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
          disabled={saving}
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
