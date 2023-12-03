import React, { useState, useEffect, useRef, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { IoAddOutline } from "react-icons/io5";
import { HiArrowLongRight } from "react-icons/hi2";
import { HiArrowLongLeft } from "react-icons/hi2";
import { IoMdCloseCircle } from "react-icons/io";

const Post = ({ previousPath }) => {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const imageUrls = useMemo(
    () => images.map((image) => URL.createObjectURL(image)),
    [images]
  );
  const [posting, setPosting] = useState(false);
  const textAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const linkPath =
    previousPath && ["/search", "/", "/reflect"].includes(previousPath)
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

  const handleImageChange = (event) => {
    if (event.target.files) {
      setImages((prevImages) => [
        ...prevImages,
        ...Array.from(event.target.files),
      ]);
    }
  };

  const handleDelete = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!text) return;
    setPosting(true);

    const formData = new FormData();
    formData.append("text", text);
    images.forEach((image, index) =>
      formData.append(`images[${index}]`, image)
    );

    try {
      const response = await fetch("/api/newNote", {
        // method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      router.push("/");
    } catch (error) {
      console.error("Failed to send note to API:", error);
    } finally {
      setPosting(false);
    }
  };
  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>post - the garden</title>
        <meta
          name="viewport"
          content="initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      <div className="flex items-center justify-between gap-x-4 pt-6 pb-2">
        <Link href={linkPath} passHref>
          <div className="text-orange-500 flex items-center justify-center">
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
          disabled={posting}
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
      </div>
      <div
        className={clsx(
          posting && "animate-pulse",
          "flex-grow bg-zinc-900/80 border border-zinc-800/60 rounded-2xl flex flex-col"
        )}
      >
        <textarea
          value={text}
          disabled={posting}
          onChange={handleTextChange}
          ref={textAreaRef}
          autoFocus
          className="flex-1 w-full font-workSans p-4 focus:outline-none bg-transparent resize-none"
          placeholder="what's are you thinking?"
        ></textarea>
        {images.length !== 0 && (
          <div className="flex flex-wrap gap-x-4 px-4 py-2">
            {imageUrls.map((imageUrl, index) => (
              <div key={index} className="relative">
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
                  className="absolute -top-3 -right-3"
                >
                  <IoMdCloseCircle className="w-6 h-6 fill-red-500 bg-zinc-900 rounded-full" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-end py-2">
        {posting ? (
          <div role="status" className="mr-2">
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
        ) : (
          <button
            className="text-blue-400 rounded-md"
            onClick={handleSubmit}
            disabled={posting}
          >
            <div className="flex items-center justify-center">
              <span>post</span>
              <HiArrowLongRight className="w-6 h-6 ml-2" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default Post;
