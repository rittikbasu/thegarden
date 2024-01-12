import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import clsx from "clsx";

import { db } from "@/utils/db";
import { formatNotes } from "@/utils/formatNotes";
import { createImageUrls, imageToBlob } from "@/utils/imageTransforms";
import DeleteModal from "@/components/DeleteModal";
import Carousel from "@/components/Carousel";

import { IoAddOutline } from "react-icons/io5";
import { HiArrowLongLeft } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";
import { AiFillEdit } from "react-icons/ai";
import { MdDelete, MdCancel } from "react-icons/md";
import { MdOutlineFileDownloadDone } from "react-icons/md";

const OriginalView = ({
  isEditing,
  text,
  editedNote,
  highlight,
  handleTextChange,
  handleTextAreaFocus,
}) => {
  return isEditing ? (
    <textarea
      value={editedNote}
      onChange={handleTextChange}
      onFocus={handleTextAreaFocus}
      autoFocus
      className="bg-transparent tracking-widest scrollbar-hide resize-none flex-1 w-full focus:outline-none"
      placeholder="what's are you thinking?"
      style={{ wordSpacing: "0.2em", height: "100%" }}
    ></textarea>
  ) : (
    <div
      className="break-words whitespace-pre-wrap h-full"
      style={{ wordSpacing: "0.2em" }}
    >
      {highlight ? (
        <span
          dangerouslySetInnerHTML={{
            __html: text.replace(
              new RegExp(highlight, "ig"),
              `<span style="background-color: yellow; color: black; font-weight: bold; border-radius: 5px; padding: 0 2px; margin: 0 0.5px;">$&</span>`
            ),
          }}
        />
      ) : (
        text
      )}
    </div>
  );
};

export default function NotePage({ previousPath }) {
  const router = useRouter();
  const { id, highlight } = router.query;
  const [text, setText] = useState("");
  const [editedNote, setEditedNote] = useState("");
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [editedImages, setEditedImages] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const fileInputRef = useRef(null);

  async function fetchNoteData(id) {
    const result = await db.notes.get(id);
    const data = formatNotes([result])[0];
    const blobUrls = createImageUrls(data.images);
    setImages(data.images);
    setImageUrls(blobUrls);
    setText(data.text);
    setDate(data.date);
    setTime(data.time);
    setEditedNote(data.text);
    setEditedImages(data.images);
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

  const handleImageBtnClick = () => {
    if (editedImages.length >= 4) {
      alert("You can only add up to 4 images.");
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = async (event) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      let images = files.filter((file) => file.type.startsWith("image/")); // Filter out non-image images

      if (images.length === 0) {
        alert("No images were selected.");
        return;
      }
      const spaceForNewImages = 4 - editedImages.length;
      if (images.length > spaceForNewImages) {
        images = images.slice(0, spaceForNewImages);
        alert("You can only add up to 4 images.");
      }
      const blobs = await Promise.all(images.map((file) => imageToBlob(file)));
      const blobUrls = createImageUrls(blobs);
      setEditedImages((prevImages) => [...prevImages, ...blobs]);
      setImageUrls((prevImages) => [...prevImages, ...blobUrls]);
    }
  };

  function handleImageDelete(index) {
    setImageUrls((prevImages) => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      return newImages;
    });
    setEditedImages((prevImages) => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      return newImages;
    });
  }

  const handleImageClick = (index) => {
    setShowCarousel(true);
    setSelectedImageIndex(index);
  };

  function handleDelete() {
    setShowModal(true);
  }

  async function handleConfirmDelete() {
    await db.notes.delete(id);
    router.push("/");
    setShowModal(false);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  function handleCancel() {
    setEditedNote(text);
    setImageUrls(createImageUrls(images));
    setEditedImages(images);
    setIsEditing(false);
  }

  async function handleSave() {
    if (text !== editedNote || images !== editedImages) {
      try {
        await db.notes
          .update(id, {
            text: editedNote,
            images: editedImages,
          })
          .then((updated) => {
            if (updated) {
              console.log(`Note ${id} updated`);
            } else {
              console.log(`Note ${id} not found`);
            }
          });
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
    previousPath &&
    ["/search", "/", "/reflect", "/settings"].includes(previousPath)
      ? previousPath
      : "/";
  return (
    <div
      className={clsx(
        "flex flex-col h-screen py-4",
        imageUrls && imageUrls.length !== 0 ? "pb-16" : "pb-10"
      )}
    >
      <div className="fixed top-2 left-1/2 transform -translate-x-1/2 px-4 lg:px-0 w-full max-w-md">
        <div className="flex border bg-black/50 border-zinc-800/80 rounded-xl items-center text-zinc-400 justify-between px-4 py-2">
          {isEditing ? (
            <>
              <button
                className="text-zinc-400"
                onClick={handleImageBtnClick}
                type="button"
              >
                <div className="flex items-center justify-center">
                  <IoAddOutline className="w-5 h-5 mr-1" />
                  <span>images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden focus:outline-none outline-none"
                    ref={fileInputRef}
                  />
                </div>
              </button>
              <button
                onClick={handleCancel}
                className="text-red-500/80 flex items-center justify-center"
              >
                <MdCancel className="inline-block w-5 h-5 mr-1" />
              </button>
              <button
                className="text-blue-400 flex items-center"
                onClick={handleSave}
              >
                done
                <MdOutlineFileDownloadDone className="inline-block w-5 h-5 ml-2" />
              </button>
            </>
          ) : (
            <>
              <Link href={linkPath} passHref>
                <div className="text-orange-500 flex items-center justify-center">
                  <div className="flex items-center justify-center">
                    <HiArrowLongLeft className="w-6 h-6 mr-2" />
                    <span>back</span>
                  </div>
                </div>
              </Link>
              <button
                onClick={handleDelete}
                className="text-red-500/80 flex items-center justify-center"
              >
                <MdDelete className="inline-block w-5 h-5 mr-1" />
              </button>
              <button onClick={handleEdit} className="text-blue-400">
                edit
                <AiFillEdit className="inline-block w-5 h-5 ml-2" />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center text-sm text-zinc-400 lg:py-8 pt-14 pb-4">
        <p>{date ? date.toLowerCase() : ""}</p>
        <p className="mx-2">•</p>
        <p>{time ? time.toLowerCase() : ""}</p>
      </div>

      <div className="flex-grow flex flex-col focus:outline-none tracking-widest text-zinc-100 overflow-y-scroll scrollbar-hide font-light">
        <div className="pb-4 h-full">
          <OriginalView
            {...{
              isEditing,
              text,
              editedNote,
              highlight,
              handleTextChange,
              handleTextAreaFocus,
            }}
          />
        </div>
        {imageUrls && imageUrls.length !== 0 ? (
          <div className="flex fixed bottom-4 pt-4 whitespace-nowrap gap-x-4">
            {imageUrls.map((image, index) => (
              <div key={index} className="relative shrink-0">
                <Image
                  src={image}
                  alt={`image-${index}`}
                  height={64}
                  width={64}
                  className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg border-zinc-800/60 border"
                  onClick={isEditing ? null : () => handleImageClick(index)}
                />
                {isEditing && (
                  <button
                    onClick={() => handleImageDelete(index)}
                    className="absolute -top-2.5 -right-2.5"
                  >
                    <IoClose className="w-5 h-5 fill-zinc-200 bg-red-500 rounded-full" />
                  </button>
                )}
              </div>
            ))}
            <Carousel
              isOpen={showCarousel}
              images={imageUrls}
              onClose={() => setShowCarousel(false)}
              selectedImageIndex={selectedImageIndex}
              setSelectedImageIndex={setSelectedImageIndex}
            />
          </div>
        ) : null}
        <DeleteModal
          isOpen={showModal}
          onDelete={handleConfirmDelete}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}
