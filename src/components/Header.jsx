import React from "react";
import Link from "next/link";
import { GiOrangeSlice } from "react-icons/gi";

const Header = () => (
  <header className="mb-12 pt-6">
    <h1 className="text-3xl font-semibold">
      the garden <GiOrangeSlice className="inline-block w-6 h-6" />
    </h1>
  </header>
);

export default Header;
