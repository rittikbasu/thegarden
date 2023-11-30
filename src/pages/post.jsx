import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HiOutlineUpload } from "react-icons/hi";
import { FaMicrophone } from "react-icons/fa";
import { HiArrowLongRight } from "react-icons/hi2";
import { HiArrowLongLeft } from "react-icons/hi2";

const Post = ({ previousPath }) => {
  const [text, setText] = useState("");
  const textAreaRef = useRef(null);

  const linkPath =
    previousPath && ["/search", "/", "/reflect"].includes(previousPath)
      ? previousPath
      : "/";

  useEffect(() => {
    textAreaRef.current.focus();
  }, []);

  const handleTextChange = (event) => {
    setText(event.target.value);
    console.log(event.target.value);
  };
  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-x-4 pt-6 pb-2">
        <Link href={linkPath} passHref>
          <div className="text-orange-500 flex items-center justify-center">
            <div className="flex items-center justify-center">
              <HiArrowLongLeft className="w-6 h-6 mr-2" />
              <span>back</span>
            </div>
          </div>
        </Link>
      </div>

      <textarea
        value={text}
        onChange={handleTextChange}
        ref={textAreaRef}
        autoFocus
        className="flex-grow focus:outline-none p-4 bg-zinc-900/80 border border-zinc-800/60 rounded-2xl"
        placeholder="what's are you thinking?"
      ></textarea>
      <div className="flex items-center justify-between">
        {" "}
        <button className="text-zinc-400 py-4 rounded-md">
          <div className="flex items-center justify-center">
            <HiOutlineUpload className="w-5 h-5 mr-2" />
            <span>image</span>
          </div>
        </button>
        <button className="text-blue-400 py-2 rounded-md">
          <div className="flex items-center justify-center">
            <span>post</span>
            <HiArrowLongRight className="w-6 h-6 ml-2" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Post;
