import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

import { db } from "@/utils/db";
import { formatNotes } from "@/utils/formatNotes";
import Spinner from "@/components/Spinner";
import DeleteModal from "@/components/DeleteModal";

import { IoAddOutline } from "react-icons/io5";
import { HiArrowLongLeft } from "react-icons/hi2";
import { IoMdCloseCircle } from "react-icons/io";

export default function NotePage({ previousPath }) {
  const router = useRouter();
  const { id } = router.query;
  console.log(id);
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function fetchNoteData(id) {
    const result = await db.notes.get(id);
    const data = formatNotes([result])[0];
    const newImages = [];

    data.images?.forEach((image) => {
      if (image.thumbnailUrl) {
        newImages.push(image.thumbnailUrl);
      } else {
        const blob = new Blob([image], { type: image.type });
        const imageUrl = URL.createObjectURL(blob);
        newImages.push(imageUrl);
      }
    });
    setImages(newImages);
    setText(data.text);
    setDate(data.date);
    setTime(data.time);
    setEditedNote(data.text);
  }

  useEffect(() => {
    if (id) {
      fetchNoteData(id);
    }
  }, [id]);

  const handleEdit = () => setIsEditing(true);

  const handleTextChange = (event) => setEditedNote(event.target.value);

  function handleTextAreaFocus(event) {
    const val = event.target.value;
    event.target.value = "";
    event.target.value = val;
  }

  function handleDelete() {
    setShowModal(true);
  }

  async function handleConfirmDelete() {
    const response = await fetch("/api/deleteNote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: note.id,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    router.push("/");
    setShowModal(false);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  async function handleSave() {
    if (text !== editedNote) {
      setSaving(true);
      try {
        await db.notes
          .update(id, {
            text: editedNote,
          })
          .then((updated) => {
            if (updated) {
              console.log(`Note ${id} updated`);
            } else {
              console.log(`Note ${id} not found`);
            }
          });
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
        {isEditing ? (
          <button className="text-zinc-400">
            <IoAddOutline className="inline-block w-5 h-5 mr-1" />
            images
          </button>
        ) : (
          <Link href={linkPath} passHref>
            <div className="text-orange-500 flex items-center justify-center">
              <div className="flex items-center justify-center">
                <HiArrowLongLeft className="w-6 h-6 mr-2" />
                <span>back</span>
              </div>
            </div>
          </Link>
        )}
        {isEditing ? (
          !saving ? (
            <button className="text-blue-400" onClick={handleSave}>
              {text === editedNote ? "done" : "save"}
            </button>
          ) : (
            <Spinner svgClassName="w-6 h-6 fill-blue-500" />
          )
        ) : (
          <button className="text-blue-400" onClick={handleEdit}>
            edit
          </button>
        )}
      </div>
      <div className="flex items-center text-sm text-zinc-400 justify-between pt-8 pb-4 mx-2">
        <p>{date ? date.toLowerCase() : ""}</p>
        <p>{time ? time.toLowerCase() : ""}</p>
      </div>
      <div className="flex-grow flex flex-col focus:outline-none tracking-widest font-workSans text-zinc-100 overflow-y-scroll font-light bg-zinc-900/80 border border-zinc-800/60 rounded-2xl">
        {!isEditing ? (
          <div
            className="break-words whitespace-pre-wrap h-full p-4 overflow-y-scroll"
            placeholder="what's are you thinking?"
            style={{ wordSpacing: "0.2em" }}
          >
            {text}
          </div>
        ) : (
          <textarea
            value={editedNote}
            onChange={handleTextChange}
            onFocus={handleTextAreaFocus}
            autoFocus
            className="bg-transparent resize-none flex-1 w-full focus:outline-none p-4"
            placeholder="what's are you thinking?"
            style={{ wordSpacing: "0.2em" }}
            disabled={saving}
          ></textarea>
        )}
        {images && images.length !== 0 && (
          <div className="flex flex-wrap gap-x-4 px-4 pt-4 pb-2">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <Image
                  src={image}
                  alt={`image-${index}`}
                  height={64}
                  width={64}
                  className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg border-zinc-800/60 border"
                />
                {isEditing && (
                  <button
                    onClick={() => {
                      setImages((prevImages) => {
                        const newImages = [...prevImages];
                        newImages.splice(index, 1);
                        return newImages;
                      });
                    }}
                    className="absolute -top-3 -right-3"
                    disabled={saving}
                  >
                    <IoMdCloseCircle className="w-6 h-6 fill-red-500 bg-zinc-900 rounded-full" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end px-2 pt-2">
        <button className="text-red-500" onClick={handleDelete}>
          delete
        </button>
      </div>
      <DeleteModal
        isOpen={showModal}
        onDelete={handleConfirmDelete}
        onClose={handleCloseModal}
      />
    </div>
  );
}

// export const getStaticPaths = async () => {
//   const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);
//   const { data, error } = await supabase.from("thegarden_notes").select("id");
//   return {
//     paths: data.map((note) => ({
//       params: {
//         slug: note.id.toString(),
//       },
//     })),
//     fallback: true,
//   };
// };

// export const getStaticProps = async (context) => {
//   const { slug } = context.params;
//   const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);
//   const { data, error } = await supabase
//     .from("thegarden_notes")
//     .select("*")
//     .eq("id", slug);

//   if (error) {
//     console.error("Error fetching journal data:", error);
//     return {
//       props: {
//         note: [],
//       },
//     };
//   }

//   const timestamp = new Date(data[0].created_at);
//   data[0].date = timestamp.toLocaleDateString("en-US", {
//     weekday: "short",
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   });
//   data[0].time = timestamp.toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });

//   return {
//     props: {
//       note: data[0],
//     },
//     revalidate: 1,
//   };
// };
