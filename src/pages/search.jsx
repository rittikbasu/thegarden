import React, { useState } from "react";
import clsx from "clsx";
import { LuSparkles } from "react-icons/lu";
import { IoSearchOutline } from "react-icons/io5";

const Search = ({ notes, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [aiToggle, setAiToggle] = useState(false);

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleToggle = (e) => {
    setAiToggle(e.target.checked);
  };

  return (
    <div className="flex flex-col">
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
                : "which note are you looking for?"
            }
          />
          {aiToggle && (
            <button className="mr-2 text-blue-400 flex items-center justify-center">
              <IoSearchOutline />
            </button>
          )}
        </div>
      </div>
      <label className="relative inline-flex items-center justify-end mr-1 cursor-pointer">
        <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          <LuSparkles className="inline-block w-4 h-4 mr-2" />
          ai search
        </span>
        <input
          type="checkbox"
          value=""
          className="sr-only peer"
          onChange={handleToggle}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
};

export default Search;
