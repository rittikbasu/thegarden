import React from "react";
import Link from "next/link";
import { GiOrangeSlice } from "react-icons/gi";

const Header = () => (
  <header className="mb-4 pt-6">
    <h1 className="text-3xl font-semibold">
      the garden <GiOrangeSlice className="inline-block w-6 h-6" />
    </h1>
    <div className="my-12 lg:my-16 mx-4">
      <Link href="/post" passHref>
        <div className="w-full p-2 rounded-full border-2 border-orange-500 text-center tracking-widest focus:outline-none text-zinc-400">
          what are you thinking?
          <span className=" animate-cursorblink">|</span>
        </div>
      </Link>
    </div>
  </header>
);

export default Header;
