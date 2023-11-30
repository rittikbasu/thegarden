import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import clsx from "clsx";

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
    <div className="flex justify-between mb-6 lg:mb-10 border border-zinc-700 rounded-xl">
      <Link
        href="/"
        className={clsx(
          "flex-1 px-4 py-2 text-sm font-medium border-r text-center border-zinc-700",
          activeTab === "notes" && "text-blue-400"
        )}
        onClick={() => setActiveTab("notes")}
      >
        notes
      </Link>
      <Link
        href={"/reflect"}
        className={clsx(
          "flex-1 px-4 py-2 text-sm font-medium border-r text-center border-zinc-700",
          activeTab === "reflect" && "text-blue-400"
        )}
        onClick={() => setActiveTab("reflect")}
      >
        reflect
      </Link>
      <Link
        href={"/search"}
        className={clsx(
          "flex-1 px-4 py-2 text-sm font-medium text-center",
          activeTab === "search" && "text-blue-400"
        )}
        onClick={() => setActiveTab("search")}
      >
        search
      </Link>
    </div>
  );
}

export default Tab;
