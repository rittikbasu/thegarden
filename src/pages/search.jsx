import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import clsx from "clsx";
import { VectorStorage } from "vector-storage";
import { useCompletion } from "ai/react";
import Markdown from "react-markdown";

import NotesContainer from "@/components/NotesContainer";
import SearchButton from "@/components/SearchButton";
import ReferencesAccordion from "@/components/ReferencesAccordion";
import { db } from "@/utils/db";
import { formatNotes, getFormattedDate } from "@/utils/formatNotes";
import { createMessages } from "@/utils/createMessages";

import { LuSparkles } from "react-icons/lu";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [aiSearchTerm, setAISearchTerm] = useState("");
  const [aiToggle, setAiToggle] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [aiResults, setAIResults] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [referenceData, setReferenceData] = useState([]);
  const [showReferences, setShowReferences] = useState(false);
  const [searchBtnInit, setSearchBtnInit] = useState(false);
  const lastNoteRef = useRef(null);
  const { completion, complete } = useCompletion({
    api: "/api/completion",
    onFinish: () => {
      setStreaming(false);
      setShowReferences(true);
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
      const storedReferenceData = sessionStorage.getItem("referenceData");

      if (storedSearchTerm) setSearchTerm(storedSearchTerm);
      if (storedAISearchTerm) setAISearchTerm(storedAISearchTerm);
      if (storedAIResults) setAIResults(storedAIResults);
      if (storedAIToggle) setAiToggle(JSON.parse(storedAIToggle));
      if (storedReferenceData) {
        setReferenceData(JSON.parse(storedReferenceData));
        setShowReferences(true);
      }
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
    setShowReferences(false);
    sessionStorage.setItem("aiSearchTerm", aiSearchTerm);
    setAIResults("");
    setReferenceData([]);

    const vectorStore = new VectorStorage({
      openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });

    const results = await vectorStore.similaritySearch({
      query: aiSearchTerm,
      k: 30,
    });
    const filteredResults = results.similarItems.filter(
      (item) => item.score > 0.84
    );
    console.log(filteredResults);
    const formattedResults = filteredResults.map((item) => item.text);
    const resultMetadata = filteredResults.map((item) => ({
      id: item.metadata.id,
      score: item.score.toFixed(2),
    }));

    const messages = await createMessages(aiSearchTerm, formattedResults);

    complete({ messages }).then((res) => {
      setAIResults(res);
      setReferenceData(resultMetadata);
      sessionStorage.setItem("aiSearchResults", res);
      sessionStorage.setItem("referenceData", JSON.stringify(resultMetadata));
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
      <p className="ml-2 pb-1 text-sm text-gray-500">
        {aiToggle
          ? "talk to your notes & find insights with ai"
          : "find your notes using characters or dates"}
      </p>
      <div className="w-full pb-4 flex justify-center">
        <div
          ref={containerRef}
          className={clsx(
            aiToggle === true
              ? "border-blue-500/80 shadow-blue-500/50"
              : "border-zinc-600/60 shadow-none",
            "w-full max-w-lg rounded-xl transition-all bg-grid-small-white/[0.1] bg-black overflow-hidden duration-700 shadow-lg border flex justify-between items-center h-[3rem]"
          )}
        >
          {aiToggle ? (
            <textarea
              value={aiSearchTerm}
              onChange={(e) => {
                setAISearchTerm(e.target.value);
                setSearchBtnInit(true);
              }}
              ref={textareaRef}
              onInput={adjustTextareaHeight}
              className="bg-transparent resize-none overflow-hidden py-1 w-full focus:outline-none px-4 placeholder:text-blue-400/70"
              placeholder="what's on your mind?"
              maxLength={150}
              style={{ height: "auto" }}
              rows={1}
              disabled={streaming}
            />
          ) : (
            <input
              autoComplete="off"
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
          <span className="mr-3 text-sm font-medium text-gray-300">
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
            <div className="w-11 h-6 peer-focus:outline-none rounded-full peer bg-zinc-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {aiToggle && (
          // <button
          //   className="py-0.5 px-2 rounded-lg bg-blue-600 shadow-inner shadow-black/50 flex items-center justify-center"
          //   onClick={handleAISearch}
          //   disabled={streaming}
          // >
          //   <IoSearchOutline className="w-4 h-4 mr-1" />
          //   search
          // </button>
          <SearchButton
            streaming={streaming}
            handleSearch={handleAISearch}
            searchResult={aiResults}
            searchInput={searchBtnInit ? aiSearchTerm : false}
            disabled={streaming}
          />
        )}
      </div>
      <div className="pb-12 pt-8">
        {aiToggle ? (
          <>
            {(completion !== "" || aiResults !== "") && (
              <div className="border h-full bg-black border-zinc-800/80 rounded-xl overflow-hidden">
                <div className="w-full px-2 bg-black bg-grid-small-white/[0.2] relative flex items-center justify-center">
                  <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"></div>
                  <div className="flex z-10 min-h-[20rem] flex-col justify-start items-start rounded-xl pt-4 px-2 markdown text-zinc-400">
                    <Markdown>{streaming ? completion : aiResults}</Markdown>
                  </div>
                </div>
              </div>
            )}{" "}
            {showReferences && (
              <div className="pb-12">
                <ReferencesAccordion
                  metadata={streaming ? [] : referenceData}
                />
              </div>
            )}
          </>
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
