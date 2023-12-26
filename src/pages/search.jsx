import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import clsx from "clsx";

import NotesContainer from "@/components/NotesContainer";
import { db } from "@/utils/db";
import { formatNotes } from "@/utils/formatNotes";

import { LuSparkles } from "react-icons/lu";
import { IoSearchOutline } from "react-icons/io5";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [aiToggle, setAiToggle] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const lastNoteRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSearchTerm = sessionStorage.getItem("searchTerm");

      if (storedSearchTerm) setSearchTerm(storedSearchTerm);
    }
  }, []);

  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }
    const results = await db.notes
      .orderBy("created_at")
      .reverse()
      .filter((note) =>
        note.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .toArray();
    // console.log(formatTimestamp(results[0]?.created_at));
    setSearchResults(formatNotes(results));
  };

  useEffect(() => {
    sessionStorage.setItem("searchTerm", searchTerm);
    if (aiToggle === false) {
      handleSearch();
    }
  }, [searchTerm, aiToggle]);

  const handleToggle = (e) => {
    setAiToggle(e.target.checked);
  };

  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

      if (containerRef.current) {
        containerRef.current.style.minHeight = `${textareaRef.current.scrollHeight}px`;
      }
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [searchTerm, aiToggle]);

  return (
    <div className="flex flex-col">
      <Head>
        <title>search - the garden</title>
      </Head>
      <div>
        <p className="ml-2 pb-1 text-sm text-gray-500">
          {aiToggle
            ? "talk to your notes, find insights with ai"
            : "find your notes using characters or dates"}
        </p>
      </div>
      <div className="w-full pb-4 flex justify-center">
        <div
          ref={containerRef}
          className={clsx(
            aiToggle === true
              ? "border-blue-500/80 shadow-blue-500/50"
              : "border-zinc-500/60 shadow-zinc-500/40",
            "w-full max-w-lg rounded-xl transition duration-700 shadow-lg bg-zinc-900/60 border flex justify-between items-center"
          )}
          style={{ height: "2.5rem" }}
        >
          {aiToggle ? (
            <textarea
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              ref={textareaRef}
              onInput={adjustTextareaHeight}
              className="bg-transparent resize-none overflow-hidden py-1 w-full focus:outline-none px-4"
              placeholder=""
              maxLength={150}
              style={{ height: "auto" }}
            />
          ) : (
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              className="bg-transparent py-1 w-full focus:outline-none px-4"
              placeholder="type to search"
              maxLength={30}
            />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mx-1">
        <div className="flex items-center">
          <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            <LuSparkles className="inline-block w-4 h-4 mr-2" />
            ai search
          </span>
          <label className="relative cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              onChange={handleToggle}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {aiToggle && (
          <button
            className="py-0.5 px-2 rounded-lg bg-blue-500  flex items-center justify-center"
            onClick={handleSearch}
          >
            <IoSearchOutline className="w-4 h-4 mr-1" />
            search
          </button>
        )}
      </div>
      <div className="pb-12 pt-8">
        <NotesContainer
          notes={searchResults}
          scrollPositionKey={"searchScrollPosition"}
          lastNoteRef={lastNoteRef}
          highlight={searchTerm}
        />
      </div>
    </div>
  );
};

export default Search;
