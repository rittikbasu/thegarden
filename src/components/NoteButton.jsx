import Link from "next/link";
import { IoAdd } from "react-icons/io5";
import clsx from "clsx";

const AddNoteButton = ({ animate }) => {
  return (
    <Link href="/post" className="flex items-center justify-center">
      <div className="relative">
        <button className="z-10 flex items-center justify-center p-4 rounded-full outline outline-orange-600 outline-offset-2 bg-zinc-800/90 text-2xl w-18 h-18">
          <IoAdd className="w-10 h-10 text-orange-500" />
        </button>
        <svg
          className={clsx(
            "absolute top-0 left-0 w-full h-full animate-spin-slow",
            !animate && "[animation-play-state:paused] lg:animate-spin-slow"
          )}
          viewBox="0 0 100 100"
        >
          <path
            id="circle-path"
            fill="transparent"
            d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0 "
          />
          <text>
            <textPath
              href="#circle-path"
              startOffset="0%"
              style={{
                fontSize: "0.88em",
                fill: "white",
                fontFamily: "var(--font-poppins)",
              }}
            >
              add note • add note • add note •
            </textPath>
          </text>
        </svg>
      </div>
    </Link>
  );
};

export default AddNoteButton;
