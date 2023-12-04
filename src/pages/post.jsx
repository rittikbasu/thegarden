import React, { useState, useEffect, useRef, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import Spinner from "@/components/Spinner";
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

  const BackButtonWrapper = ({ children, href }) => {
    return posting ? (
      <div>{children}</div>
    ) : (
      <Link href={href} passHref>
        {children}
      </Link>
    );
  };

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
        method: "POST",
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
        <BackButtonWrapper href={linkPath}>
          <div
            className={clsx(
              posting ? "text-orange-800" : "text-orange-500",
              "flex items-center justify-center"
            )}
          >
            <div className="flex items-center justify-center">
              <HiArrowLongLeft className="w-6 h-6 mr-2" />
              <span>back</span>
            </div>
          </div>
        </BackButtonWrapper>
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
                  disabled={posting}
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
          <Spinner
            containerClassName="mr-2"
            svgClassName="w-6 h-6 fill-blue-500"
          />
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
