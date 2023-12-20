import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

import { db } from "@/utils/db";
import { formatNotes } from "@/utils/formatNotes";
import { createImageUrls, imageToBlob } from "@/utils/imageTransforms";
import DeleteModal from "@/components/DeleteModal";
import Carousel from "@/components/Carousel";

import { IoAddOutline } from "react-icons/io5";
import { HiArrowLongLeft } from "react-icons/hi2";
import { IoMdCloseCircle } from "react-icons/io";
import { AiFillEdit } from "react-icons/ai";
import { MdOutlineFileDownloadDone } from "react-icons/md";

export default function NotePage({ previousPath }) {
  const router = useRouter();
  const { id } = router.query;
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
    previousPath && ["/search", "/", "/reflect"].includes(previousPath)
      ? previousPath
      : "/";
  return (
    <div className="flex flex-col h-screen pb-4">
      <div className="flex items-center justify-between gap-x-4 pt-8 pb-2">
        {isEditing ? (
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
        <div className="flex justify-center items-center">
          <button
            className="text-red-500/90"
            onClick={isEditing ? handleCancel : handleDelete}
          >
            {isEditing ? "cancel" : "delete"}
          </button>
        </div>
        {isEditing ? (
          <button
            className="text-blue-400 flex items-center"
            onClick={handleSave}
          >
            done
            <MdOutlineFileDownloadDone className="inline-block w-5 h-5 ml-2" />
          </button>
        ) : (
          <button className="text-blue-400" onClick={handleEdit}>
            edit
            <AiFillEdit className="inline-block w-5 h-5 ml-2" />
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
          ></textarea>
        )}
        {imageUrls && imageUrls.length !== 0 && (
          <div className="flex flex-wrap gap-x-4 px-4 pt-4 pb-2">
            {imageUrls.map((image, index) => (
              <div key={index} className="relative">
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
                    className="absolute -top-3 -right-3"
                  >
                    <IoMdCloseCircle className="w-6 h-6 fill-red-500 bg-zinc-900 rounded-full" />
                  </button>
                )}
              </div>
            ))}
            <Carousel
              isOpen={showCarousel}
              images={imageUrls}
              onClose={() => setShowCarousel(false)}
              selectedImageIndex={selectedImageIndex}
            />
          </div>
        )}
      </div>
      <DeleteModal
        isOpen={showModal}
        onDelete={handleConfirmDelete}
        onClose={handleCloseModal}
      />
    </div>
  );
}
