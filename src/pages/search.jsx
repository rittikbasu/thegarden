import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import clsx from "clsx";
import { VectorStorage } from "vector-storage";
import { useCompletion } from "ai/react";
import Markdown from "react-markdown";

import NotesContainer from "@/components/NotesContainer";
import { db } from "@/utils/db";
import { formatNotes, getFormattedDate } from "@/utils/formatNotes";

import { LuSparkles } from "react-icons/lu";
import { IoSearchOutline } from "react-icons/io5";

const createMessages = (aiSearchTerm, formattedResults) => {
  const prompt =
    `Search prompt: ${aiSearchTerm},\n Journal Entries:\n` +
    JSON.stringify(formattedResults);
  return [
    {
      role: "system",
      content:
        "You are a personal knowledge base that has access to me, the user's journal entries. You will always address me in the first person. Now, given the search prompt, you will analyze the journal entries provided and give insights only based on the relevant information. You can respond in simple markdown in a structured and easy to read format and if no relevant information is found, respond with 'no results found' in lowercase.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];
};

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [aiSearchTerm, setAISearchTerm] = useState("");
  const [aiToggle, setAiToggle] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [aiResults, setAIResults] = useState("");
  const [streaming, setStreaming] = useState(false);
  const lastNoteRef = useRef(null);
  const { completion, complete } = useCompletion({
    api: "/api/completion",
    onFinish: () => {
      setStreaming(false);
      console.log("finished");
    },
    onError: (err) => {
      setStreaming(false);
      console.log(err);
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSearchTerm = sessionStorage.getItem("searchTerm");
      const storedAISearchTerm = sessionStorage.getItem("aiSearchTerm");
      const storedAIResults = sessionStorage.getItem("aiSearchResults");
      const storedAIToggle = sessionStorage.getItem("aiToggle");

      if (storedSearchTerm) setSearchTerm(storedSearchTerm);
      if (storedAISearchTerm) setAISearchTerm(storedAISearchTerm);
      if (storedAIResults) setAIResults(storedAIResults);
      if (storedAIToggle) setAiToggle(JSON.parse(storedAIToggle));
    }
  }, []);

  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }
    const search = searchTerm.toLowerCase();
    const results = await db.notes
      .orderBy("created_at")
      .reverse()
      .filter(
        (note) =>
          note.text.toLowerCase().includes(search) ||
          getFormattedDate(note.created_at).toLowerCase().includes(search)
      )
      .toArray();
    setSearchResults(formatNotes(results));
  };

  const handleAISearch = async () => {
    if (aiSearchTerm.trim() === "") return;

    setStreaming(true);
    sessionStorage.setItem("aiSearchTerm", aiSearchTerm);
    setAIResults("");

    const vectorStore = new VectorStorage({
      openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });

    const results = await vectorStore.similaritySearch({
      query: aiSearchTerm,
      k: 30,
    });

    const formattedResults = results.similarItems.map((item) => item.text);

    const messages = createMessages(aiSearchTerm, formattedResults);

    complete({ messages }).then((res) => {
      setAIResults(res);
      sessionStorage.setItem("aiSearchResults", res);
    });
  };

  useEffect(() => {
    adjustTextareaHeight();
    sessionStorage.setItem("searchTerm", searchTerm);
    if (aiToggle === false) {
      handleSearch();
    }
  }, [searchTerm, aiToggle]);

  const handleToggle = (e) => {
    setAiToggle(e.target.checked);
    sessionStorage.setItem("aiToggle", e.target.checked);
  };

  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  const adjustTextareaHeight = () => {
    if (aiToggle) {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

        if (containerRef.current) {
          containerRef.current.style.minHeight = `${textareaRef.current.scrollHeight}px`;
        }
      }
    } else {
      containerRef.current.style.minHeight = "3rem";
    }
  };

  return (
    <div className="flex flex-col">
      <Head>
        <title>search - the garden</title>
      </Head>
      <div>
        <p className="ml-2 pb-1 text-sm font-workSans text-gray-500">
          {aiToggle
            ? "talk to your notes & find insights with ai"
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
            "w-full max-w-lg rounded-xl transition-all overflow-hidden duration-700 shadow-lg bg-zinc-900/60 border flex justify-between items-center font-workSans h-[3rem]"
          )}
        >
          {aiToggle ? (
            <textarea
              value={aiSearchTerm}
              onChange={(e) => {
                setAISearchTerm(e.target.value);
              }}
              ref={textareaRef}
              onInput={adjustTextareaHeight}
              className="bg-transparent resize-none overflow-hidden py-1 w-full focus:outline-none px-4 placeholder:text-blue-400/70"
              placeholder="what's on your mind?"
              maxLength={150}
              style={{ height: "auto" }}
              rows={1}
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
              checked={aiToggle}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {aiToggle && (
          <button
            className="py-0.5 px-2 rounded-lg bg-blue-600 shadow-inner shadow-black/50 flex items-center justify-center"
            onClick={handleAISearch}
            disabled={streaming}
          >
            <IoSearchOutline className="w-4 h-4 mr-1" />
            search
          </button>
        )}
      </div>
      <div className="pb-12 pt-8">
        {aiToggle ? (
          (completion !== "" || aiResults !== "") && (
            <div className="flex items-center justify-center pb-12">
              <div className="bg-zinc-900/60 w-full rounded-xl flex p-4 overflow-y-auto">
                <p className="text-base font-workSans text-zinc-400">
                  <Markdown>{streaming ? completion : aiResults}</Markdown>
                </p>
              </div>
            </div>
          )
        ) : (
          <NotesContainer
            notes={searchResults}
            scrollPositionKey={"searchScrollPosition"}
            lastNoteRef={lastNoteRef}
            highlight={searchTerm}
          />
        )}
      </div>
    </div>
  );
};

export default Search;
