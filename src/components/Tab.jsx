import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import clsx from "clsx";

import { FaNoteSticky } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { RiBrainFill } from "react-icons/ri";

function Tab() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("notes");

  useEffect(() => {
    const path = router.asPath;
    if (path === "/") {
      setActiveTab("notes");
    } else if (path === "/reflect") {
      setActiveTab("reflect");
    } else if (path === "/search") {
      setActiveTab("search");
    }
  }, [router.asPath]);
  return (
    <div className="fixed bottom-0 md:bottom-1 left-0 right-0 z-50 max-w-md translate-x-0 mx-auto">
      <div className="flex justify-between items-center bg-zinc-900/50 md:border md:rounded-xl border-t border-zinc-800 backdrop-blur-md">
        <Link
          href="/"
          className={clsx(
            "flex-1 flex flex-col items-center px-4 py-1.5 text-xs md:text-base md:py-2.5 font-medium",
            activeTab === "notes" && "text-blue-400"
          )}
          onClick={() => setActiveTab("notes")}
        >
          <FaNoteSticky className="w-5 h-5 mb-1 md:hidden" />
          notes
        </Link>
        <Link
          href={"/reflect"}
          className={clsx(
            "flex-1 flex flex-col items-center px-4 py-1.5 text-xs md:text-base md:py-2.5 font-medium",
            activeTab === "reflect" && "text-blue-400"
          )}
          onClick={() => setActiveTab("reflect")}
        >
          <RiBrainFill className="w-5 h-5 mb-1 md:hidden" />
          reflect
        </Link>
        <Link
          href={"/search"}
          className={clsx(
            "flex-1 flex flex-col items-center px-4 py-1.5 text-xs md:text-base md:py-2.5 font-medium",
            activeTab === "search" && "text-blue-400"
          )}
          onClick={() => setActiveTab("search")}
        >
          <IoSearch className="w-5 h-5 mb-1 md:hidden" />
          search
        </Link>
      </div>
    </div>
  );
}

export default Tab;
