import React, { useState, useEffect } from "react";
import Head from "next/head";
import clsx from "clsx";

import NotesContainer from "@/components/NotesContainer";
import { db } from "@/utils/db";
import { formatNotes } from "@/utils/formatNotes";

import { LuSparkles } from "react-icons/lu";
import { IoSearchOutline } from "react-icons/io5";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState(() => {
    return sessionStorage.getItem("searchTerm") || "";
  });
  const [aiToggle, setAiToggle] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

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
    console.log(formatNotes(results));
    setSearchResults(formatNotes(results));
  };

  useEffect(() => {
    sessionStorage.setItem("searchTerm", searchTerm);
    if (aiToggle === false) {
      handleSearch();
    }
  }, [searchTerm]);

  const handleToggle = (e) => {
    setAiToggle(e.target.checked);
  };

  return (
    <div className="flex flex-col">
      <Head>
        <title>search - the garden</title>
      </Head>
      <div className="w-full pb-4 flex justify-center">
        <div
          className={clsx(
            aiToggle === true
              ? "border-blue-500/80 shadow-blue-500/50"
              : "border-zinc-500/60 shadow-zinc-500/40",
            "p-2 w-full max-w-lg rounded-xl transition duration-700 shadow-lg bg-zinc-900/60 border flex justify-between items-center"
          )}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent w-full flex justify-center items-center focus:outline-none px-4 placeholder:text-center"
            placeholder={
              aiToggle
                ? "ask me all about your notes"
                : "find notes using words or dates"
            }
            maxLength={aiToggle ? 100 : 30}
          />
          {aiToggle && (
            <button
              className="mr-2 text-blue-400 flex items-center justify-center"
              onClick={handleSearch}
            >
              <IoSearchOutline />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end mr-1">
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
      <div className="pb-12 pt-8">
        <NotesContainer
          notes={searchResults}
          scrollPositionKey={"searchScrollPosition"}
        />
      </div>
    </div>
  );
};

export default Search;
