"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserButton } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  {
    id: "notes",
    name: "Notes",
    component: <div />,
  },
  {
    id: "todos",
    name: "To Dos",
    component: <div />,
  },
  {
    id: "grades",
    name: "Grades",
    component: <div />,
  },
];

const Navbar = () => {
  const pathname = usePathname();

  const currentPath = pathname.substring(pathname.lastIndexOf("/") + 1);
  return (
    <>
      <ul className="flex justify-center gap-x-12 text-xl">
        {nav.map((item) => (
          <Link key={item.id} href={`/dashboard/${item.id}`}>
            <li
              key={item.id}
              className={cn(
                " px-2 cursor-pointer hover:border-b-2 hover:font-black transition-all",
                currentPath == item.id
                  ? "border-b-2 border-green-600 "
                  : "hover:border-green-100"
              )}
            >
              {item.name}
            </li>
          </Link>
        ))}
      </ul>
      <div>
        <div className="h-14"></div>
        <div className="flex justify-between items-center md:flex-row flex-col">
          <div className="flex items-center justify-between w-full">
            <div className="flex">
              <Link href="/">
                <Button className="bg-green-600">
                  <ArrowLeft className="mr-1 w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="w-4"></div>
              <h1 className="text-3xl font-bold text-gray-900 capitalize">
                My {currentPath}
              </h1>
              <div className="w-4"></div>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-16 h-16",
                },
              }}
              afterSignOutUrl="/"
            />
          </div>
        </div>
        <div className="h-8"></div>
        <Separator />
        <div className="h-8"></div>
      </div>
    </>
  );
};

export default Navbar;
