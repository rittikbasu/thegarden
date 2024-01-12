import Link from "next/link";
import clsx from "clsx";

import { FaNoteSticky } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { RiBrainFill } from "react-icons/ri";

function Navbar({ path }) {
  return (
    <div className="fixed bottom-0 font-poppins tracking-wide md:bottom-1 left-0 right-0 z-50 max-w-md translate-x-0 mx-auto">
      <div className="flex justify-between items-center bg-zinc-950/50 md:border md:rounded-xl border-t border-zinc-800 backdrop-blur-md">
        <Link
          href="/"
          className={clsx(
            "flex-1 flex flex-col items-center px-4 py-1.5 text-xs md:text-base md:py-2.5 font-medium",
            path === "/" && "text-blue-400"
          )}
        >
          <FaNoteSticky className="w-5 h-5 mb-1 md:hidden" />
          notes
        </Link>
        <Link
          href={"/reflect"}
          className={clsx(
            "flex-1 flex flex-col items-center px-4 py-1.5 text-xs md:text-base md:py-2.5 font-medium",
            path === "/reflect" && "text-blue-400"
          )}
        >
          <RiBrainFill className="w-5 h-5 mb-1 md:hidden" />
          reflect
        </Link>
        <Link
          href={"/search"}
          className={clsx(
            "flex-1 flex flex-col items-center px-4 py-1.5 text-xs md:text-base md:py-2.5 font-medium",
            path === "/search" && "text-blue-400"
          )}
        >
          <IoSearch className="w-5 h-5 mb-1 md:hidden" />
          search
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
