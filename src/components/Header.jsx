import React from "react";
import Link from "next/link";
import clsx from "clsx";
import { GiOrangeSlice } from "react-icons/gi";
import { MdOutlineManageAccounts } from "react-icons/md";

const Header = ({ path }) => (
  <header className="mb-12 lg:pt-6 pt-4 font-poppins flex justify-between items-center">
    <div className="flex items-center text-3xl font-semibold">
      <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-400">
        the garden
      </span>
      <IconWithGradient
        IconComponent={GiOrangeSlice}
        svgClassName="w-7 h-7 ml-2"
      />
    </div>
    <Link href="/settings" passHref>
      <div className="text-3xl">
        <IconWithGradient
          IconComponent={MdOutlineManageAccounts}
          svgClassName="w-7 h-7"
          iconClassName={clsx(
            "inline-block w-7 h-7",
            path === "/settings" && "fill-blue-400"
          )}
        />
      </div>
    </Link>
  </header>
);

export default Header;

const IconWithGradient = ({
  IconComponent,
  gradientId = "icon-gradient",
  svgClassName,
  iconClassName,
}) => {
  return (
    <svg className={svgClassName} viewBox="0 0 30 30">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E5E7EB" />
          <stop offset="100%" stopColor="#9CA3AF" />
        </linearGradient>
      </defs>
      <IconComponent fill={`url(#${gradientId})`} className={iconClassName} />
    </svg>
  );
};
