import React from "react";
import Link from "next/link";
import clsx from "clsx";
import { GiOrangeSlice } from "react-icons/gi";
import { MdOutlineManageAccounts } from "react-icons/md";

const Header = ({ path }) => (
  <header className="mb-12 lg:pt-6 pt-4 font-poppins flex justify-between items-center">
    <h1 className="text-3xl font-semibold">
      the garden <GiOrangeSlice className="inline-block w-6 h-6" />
    </h1>
    <Link href="/settings" passHref>
      <MdOutlineManageAccounts
        className={clsx(
          "inline-block w-7 h-7",
          path === "/settings" && "fill-blue-400"
        )}
      />
    </Link>
  </header>
);

export default Header;
