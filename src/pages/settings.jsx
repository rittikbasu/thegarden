import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import clsx from "clsx";
import { Toaster, toast } from "sonner";
import { ThreeDots } from "svg-loaders-react";

import { db } from "@/utils/db";

const Settings = () => {
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [OAKeyInput, setOAKeyInput] = useState("");
  const [keyIsValid, setKeyIsValid] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [systemPromptInput, setSystemPromptInput] = useState("");

  const handleOpenaiApiKeyChange = (e) => {
    setOAKeyInput(e.target.value);
  };

  const handleSystemPromptChange = (e) => {
    setSystemPromptInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isSystemPromptChanged = systemPrompt !== systemPromptInput;
    let isOpenaiApiKeyChanged = openaiApiKey !== OAKeyInput;

    if (!isOpenaiApiKeyChanged && !isSystemPromptChanged) return;

    setIsValidating(true);

    if (isOpenaiApiKeyChanged) {
      setOpenaiApiKey(OAKeyInput);
      try {
        const response = await fetch("/api/checkApiKey", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key: OAKeyInput }),
        });
        const data = await response.json();
        if (data.isValid) {
          await db.settings.put({
            name: "openaiApiKey",
            text: OAKeyInput,
            status: true,
          });
          setKeyIsValid(true);
        } else {
          setKeyIsValid(false);
          setIsValidating(false);
          return;
        }
      } catch (error) {
        console.error("Error:", error);
        setIsValidating(false);
        return;
      }
    }

    if (isSystemPromptChanged && keyIsValid) {
      await db.settings.put({
        name: "systemPrompt",
        text: systemPromptInput,
        status: true,
      });
      setSystemPrompt(systemPromptInput);
    } else if (!keyIsValid) {
      setIsValidating(false);
      return;
    }

    toast.success("saved successfully");
    setIsValidating(false);
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

  const fetchSettings = async () => {
    const settings = await db.settings.bulkGet([
      "systemPrompt",
      "openaiApiKey",
    ]);
    const systemPromptSettings = settings[0];
    const openaiApiKeySettings = settings[1];
    setSystemPrompt(systemPromptSettings?.text || "");
    setSystemPromptInput(systemPromptSettings?.text || "");
    setOpenaiApiKey(openaiApiKeySettings?.text || "");
    setOAKeyInput(openaiApiKeySettings?.text || "");
    !openaiApiKeySettings?.status &&
      openaiApiKeySettings?.text &&
      setKeyIsValid(false);
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [systemPrompt]);

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <>
      <Head>
        <title>settings - the garden</title>
      </Head>
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto pb-20 space-y-4"
      >
        <div className="">
          <label className="block text-zinc-200 font-bold mb-2">
            openai api key
          </label>
          <input
            type="password"
            required
            value={OAKeyInput}
            placeholder="enter your openai api key"
            onChange={handleOpenaiApiKeyChange}
            className={clsx(
              "appearance-none bg-grid-small-white/[0.1] bg-black border rounded-xl w-full h-[48px] px-4 text-zinc-400 placeholder:text-zinc-600 focus:outline-none",
              keyIsValid ? "border-zinc-800/80" : "border-red-500"
            )}
          />
          {!keyIsValid && (
            <p className="text-red-500 ml-1 mt-1 text-xs italic">
              please enter a valid api key
            </p>
          )}
        </div>
        <div className="" ref={containerRef}>
          <label className="block text-zinc-200 font-bold mb-2">
            system prompt
          </label>
          <textarea
            value={systemPromptInput}
            placeholder="enter a prompt for the system"
            onChange={handleSystemPromptChange}
            ref={textareaRef}
            onInput={adjustTextareaHeight}
            required
            className="resize-none overflow-hidden placeholder:text-zinc-600 bg-grid-small-white/[0.1] bg-black border border-zinc-800/80 rounded-xl w-full px-4 py-[0.88rem] text-zinc-400 leading-tight focus:outline-none"
            style={{ height: "auto" }}
            rows={1}
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isValidating}
            className="h-7 w-[100px] rounded-lg bg-blue-600 shadow-inner shadow-black/50 flex items-center justify-center"
          >
            {isValidating ? <ThreeDots className="w-6 h-6" /> : "save"}
          </button>
        </div>
      </form>
      <Toaster
        toastOptions={{
          style: {
            background: "black",
            color: "#4ade80",
            border: "1px solid rgb(39,39,42,0.8)",
            borderRadius: "0.8rem",
          },
        }}
        visibleToasts={1}
      />
    </>
  );
};

export default Settings;
