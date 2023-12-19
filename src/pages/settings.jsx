import { useState } from "react";

const Settings = () => {
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [prompt, setPrompt] = useState("");

  const handleOpenaiApiKeyChange = (e) => {
    setOpenaiApiKey(e.target.value);
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic here
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="mb-4">
        <label className="block text-gray-100 text-sm font-bold mb-2">
          OpenAI API Key
        </label>
        <input
          type="text"
          value={openaiApiKey}
          onChange={handleOpenaiApiKeyChange}
          className="shadow appearance-none bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-100 text-sm font-bold mb-2">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={handlePromptChange}
          className="shadow appearance-none bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white font-bold py-1 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Save
      </button>
    </form>
  );
};

export default Settings;
