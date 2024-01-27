import Link from "next/link";
import clsx from "clsx";
import { FaNoteSticky } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { RiBrainFill } from "react-icons/ri";
import { GradientIcon } from "@/components/GradientIcon";

function NavLink({
  href,
  path,
  IconComponent,
  gradientId,
  viewBox,
  selected,
  children,
}) {
  return (
    <Link
      href={href}
      className="flex-1 flex flex-col items-center px-4 py-1.5 text-xs tab:text-base tab:py-2.5"
    >
      <GradientIcon
        IconComponent={IconComponent}
        svgClassName="w-5 h-5 tab:hidden mb-1"
        iconClassName="w-5 h-5"
        gradientId={gradientId}
        viewBox={viewBox}
        selected={selected}
      />
      <span
        className={clsx(
          "font-medium bg-clip-text text-transparent bg-gradient-to-b",
          path === href
            ? "from-blue-200 to-blue-500"
            : "from-neutral-200 to-neutral-400"
        )}
      >
        {children}
      </span>
    </Link>
  );
}

function Navbar({ path }) {
  return (
    <div className="fixed bottom-0 font-poppins tracking-wide tab:bottom-1 left-0 right-0 z-50 max-w-md translate-x-0 mx-auto">
      <div className="flex justify-between bg-grid-white/[0.02] items-center bg-black/50 tab:border tab:rounded-xl border-t border-zinc-800/80 backdrop-blur-md">
        <NavLink
          href="/"
          path={path}
          IconComponent={FaNoteSticky}
          gradientId="note-sticky"
          viewBox={"0 0 13 13"}
          selected={path === "/"}
        >
          notes
        </NavLink>
        <NavLink
          href="/reflect"
          path={path}
          IconComponent={RiBrainFill}
          gradientId="brain"
          viewBox={"0 0 12 12"}
          selected={path === "/reflect"}
        >
          reflect
        </NavLink>
        <NavLink
          href="/search"
          path={path}
          IconComponent={IoSearch}
          gradientId="search"
          viewBox={"0 0 12 12"}
          selected={path === "/search"}
        >
          search
        </NavLink>
      </div>
    </div>
  );
}

export default Navbar;
