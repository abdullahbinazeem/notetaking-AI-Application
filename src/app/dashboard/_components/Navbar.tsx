"use client";

import React from "react";

interface NavbarProps {
  nav: { name: string; id: string }[];
}

const Navbar: React.FC<NavbarProps> = ({ nav }) => {
  return (
    <ul className="flex justify-center gap-x-12 text-xl">
      {nav.map((item) => (
        <li className="border-b-2 border-green-600 px-2 cursor-pointer hover:border-b-2 hover:border-green-100">
          {item.name}
        </li>
      ))}
    </ul>
  );
};

export default Navbar;
