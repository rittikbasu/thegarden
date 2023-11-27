import { useState } from "react";
import clsx from "clsx";

function Tab() {
  const [activeTab, setActiveTab] = useState("notes");
  return (
    <div className="flex justify-between mb-6 border border-zinc-700 rounded-xl">
      <button
        className={clsx(
          "flex-1 px-4 py-2 text-sm font-medium border-r border-zinc-700",
          activeTab === "notes" && "text-blue-400"
        )}
        onClick={() => setActiveTab("notes")}
      >
        notes
      </button>
      <button
        className={clsx(
          "flex-1 px-4 py-2 text-sm font-medium border-r border-zinc-700",
          activeTab === "reflect" && "text-blue-400"
        )}
        onClick={() => setActiveTab("reflect")}
      >
        reflect
      </button>
      <button
        className={clsx(
          "flex-1 px-4 py-2 text-sm font-medium",
          activeTab === "search" && "text-blue-400"
        )}
        onClick={() => setActiveTab("search")}
      >
        search
      </button>
    </div>
  );
}

export default Tab;
