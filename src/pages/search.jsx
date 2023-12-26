import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import clsx from "clsx";
import { VectorStorage } from "vector-storage";
import OpenAI from "openai";
import Markdown from "react-markdown";

import NotesContainer from "@/components/NotesContainer";
import { db } from "@/utils/db";
import { formatNotes } from "@/utils/formatNotes";

import { LuSparkles } from "react-icons/lu";
import { IoSearchOutline } from "react-icons/io5";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [aiSearchTerm, setAISearchTerm] = useState("");
  const [aiToggle, setAiToggle] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [aiResults, setAIResults] = useState("");
  const lastNoteRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSearchTerm = sessionStorage.getItem("searchTerm");
      const storedAISearchTerm = sessionStorage.getItem("aiSearchTerm");
      const storedAIResults = sessionStorage.getItem("aiSearchResults");
      console.log(storedAIResults);

      if (storedSearchTerm) setSearchTerm(storedSearchTerm);
      if (storedAISearchTerm) setAISearchTerm(storedAISearchTerm);
      if (storedAIResults) setAIResults(storedAIResults);
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

  async function main(prompt) {
    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content:
            "You are a personal knowledge base that has access to me, the user's journal entries. You will always address me in the first person. Now, given the search prompt, you will analyze the journal entries provided and give insights only based on the relevant information. You can respond in simple markdown in a structured and easy to read format and if no relevant information is found, respond with 'no results found' in lowercase.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: true,
    });
    let gptResponse = "";
    for await (const chunk of stream) {
      const lastChunk = chunk.choices[0]?.delta?.content || "";
      gptResponse += lastChunk;
      setAIResults(gptResponse);
    }
    sessionStorage.setItem("aiSearchResults", gptResponse);
  }

  const handleAISearch = async () => {
    if (aiSearchTerm.trim() === "") return;
    setAIResults("");
    const vectorStore = new VectorStorage({
      openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });

    const results = await vectorStore.similaritySearch({
      query: aiSearchTerm,
      k: 30,
      // filters: {
      //   created_at: {
      //     min: "2023-08-01T00:00:00.000Z",
      //     max: "2023-10-31T00:00:00.000Z",
      //   },
      // },
    });

    const formattedResults = results.similarItems.map((item) => item.text);

    const prompt =
      `Search prompt: ${aiSearchTerm},\n Journal Entries:\n` +
      JSON.stringify(formattedResults);

    console.log(formattedResults);
    main(prompt);
  };

  useEffect(() => {
    if (aiToggle === false) {
      sessionStorage.setItem("searchTerm", searchTerm);
      handleSearch();
    } else {
      sessionStorage.setItem("aiSearchTerm", aiSearchTerm);
    }
  }, [searchTerm, aiSearchTerm, aiToggle]);

  const handleToggle = (e) => {
    setAiToggle(e.target.checked);
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

  useEffect(() => {
    adjustTextareaHeight();
  }, [searchTerm, aiToggle]);

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
            "w-full max-w-lg rounded-xl transition-all duration-700 shadow-lg bg-zinc-900/60 border flex justify-between items-center font-workSans"
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
            className="py-0.5 px-2 rounded-lg bg-blue-600 shadow-inner shadow-black/50 flex items-center justify-center"
            onClick={handleAISearch}
          >
            <IoSearchOutline className="w-4 h-4 mr-1" />
            search
          </button>
        )}
      </div>
      <div className="pb-12 pt-8">
        {aiToggle ? (
          aiResults !== "" && (
            <div className="flex items-center justify-center pb-12">
              <div className="bg-zinc-900/60 rounded-xl flex p-4 overflow-y-auto">
                <p className="text-base font-workSans text-gray-400">
                  <Markdown>{aiResults}</Markdown>
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
