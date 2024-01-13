import React, { useState, useEffect, useRef, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import ShortUniqueId from "short-unique-id";

import { imageToBlob } from "@/utils/imageTransforms";
import { db } from "@/utils/db";

import { IoAddOutline } from "react-icons/io5";
import { HiArrowLongRight } from "react-icons/hi2";
import { HiArrowLongLeft } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";

const Post = ({ previousPath }) => {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const imageUrls = useMemo(
    () => images.map((image) => URL.createObjectURL(image)),
    [images]
  );
  const textAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const linkPath =
    previousPath &&
    ["/search", "/", "/reflect", "/settings"].includes(previousPath)
      ? previousPath
      : "/";

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  useEffect(() => {
    const imageUrls = images.map((image) => URL.createObjectURL(image));
    return () => imageUrls.forEach(URL.revokeObjectURL);
  }, [images]);

  const handleTextChange = (event) => setText(event.target.value);

  const handleImageBtnClick = () => fileInputRef.current?.click();

  const handleImageChange = async (event) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const blobs = await Promise.all(files.map((file) => imageToBlob(file)));
      setImages((prevImages) => [...prevImages, ...blobs]);
    }
  };

  const handleDelete = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!text) return;
    console.log(text, images);
    const uid = new ShortUniqueId({ length: 10 });

    try {
      await db.notes.add({
        id: uid.rnd(),
        created_at: new Date().toISOString(),
        text: text,
        images: images,
      });
      sessionStorage.setItem("homeScrollPosition", "0");
      const timestamp = encodeURIComponent(new Date().toISOString());
      router.push("/?timestamp=" + timestamp);
    } catch (error) {
      console.error("Failed to send note to API:", error);
    }
  };
  return (
    <div className="flex flex-col h-screen pb-4">
      <Head>
        <title>post - the garden</title>
        <meta
          name="viewport"
          content="initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      <div className="fixed top-2 left-1/2 transform -translate-x-1/2 px-4 md:px-0 w-full max-w-md">
        <div className="flex border bg-black/80 bg-grid-small-white/[0.1] border-zinc-800/80 rounded-xl items-center text-zinc-400 justify-between px-4 py-2">
          <Link href={linkPath} passHref>
            <div
              className={clsx(
                "flex items-center justify-center text-orange-500"
              )}
            >
              <div className="flex items-center justify-center">
                <HiArrowLongLeft className="w-6 h-6 mr-2" />
                <span>back</span>
              </div>
            </div>
          </Link>
          <button
            className="text-zinc-400 rounded-md"
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
          <button className="text-blue-400 rounded-md" onClick={handleSubmit}>
            <div className="flex items-center justify-center">
              <span>post</span>
              <HiArrowLongRight className="w-6 h-6 ml-2" />
            </div>
          </button>
        </div>
      </div>
      <div className={clsx("flex-grow flex flex-col md:mx-2 pt-14 pb-4")}>
        <textarea
          value={text}
          onChange={handleTextChange}
          ref={textAreaRef}
          autoFocus
          className="flex-1 w-full py-4 focus:outline-none bg-transparent resize-none"
          placeholder="what's are you thinking?"
        ></textarea>
        {images.length !== 0 && (
          <div className="flex overflow-x-auto whitespace-nowrap gap-x-4 py-2.5">
            {imageUrls.map((imageUrl, index) => (
              <div key={index} className="relative shrink-0">
                <Image
                  src={imageUrl}
                  alt={`image-${index}`}
                  height={64}
                  width={64}
                  className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg border-zinc-800/60 border"
                />
                <button
                  onClick={() => {
                    URL.revokeObjectURL(imageUrl);
                    handleDelete(index);
                  }}
                  className="absolute -top-2.5 -right-2.5"
                >
                  <IoClose className="w-5 h-5 fill-zinc-200 bg-red-500 rounded-full" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;
