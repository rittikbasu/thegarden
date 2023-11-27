import React, { useState } from "react";
import clsx from "clsx";
import { LuSparkles } from "react-icons/lu";

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
      <label className="relative inline-flex items-center justify-end  cursor-pointer">
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

      <div className="fixed bottom-0 w-full pb-4 px-8 inset-x-0 flex justify-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={clsx(
            aiToggle === true
              ? "border-blue-500/80 shadow-blue-500/50"
              : "border-zinc-500/60 shadow-zinc-500/40",
            "p-2 px-4 w-full max-w-lg rounded-xl transition-all duration-500 bg-zinc-900/60 focus:outline-none border shadow-inner placeholder:px-2 placeholder:text-center"
          )}
          placeholder="what are you looking for?"
        />
      </div>
    </div>
  );
};

export default Search;