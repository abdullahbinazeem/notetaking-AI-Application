import Link from "next/link";
import React from "react";
import Image from "next/image";

import { ArrowLeft } from "lucide-react";
import { UserButton, auth } from "@clerk/nextjs";

import { eq } from "drizzle-orm";
import { $notes } from "@/lib/db/schema";
import { db } from "@/lib/db";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CreateNoteDialog from "@/components/CreateNoteDialog";
import DeleteButton from "@/components/DeleteButton";
import Navbar from "./_components/Navbar";

type Props = {};

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

const DashboardPage = async (props: Props) => {
  const { userId } = auth();
  const notes = await db
    .select()
    .from($notes)
    .where(eq($notes.userId, userId!));

  return (
    <>
      <div className="grainy min-h-screen">
        <div className="max-w-7xl mx-auto p-10">
          <div className="w-full">
            <Navbar
              nav={nav.map((item) => ({
                id: item.id,
                name: item.name,
              }))}
            />
          </div>
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
                  <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
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
          {/* list all the notes */}

          {notes.length === 0 && (
            <div className="text-center">
              <h2 className="text-xl text-gray-500">You have no notes yet.</h2>
            </div>
          )}

          {/* display all the notes */}
          <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 grid-cols-1 gap-x-3 gap-y-5">
            <CreateNoteDialog />
            {notes.map((note) => {
              return (
                <div
                  className="relative  hover:shadow-xl transition hover:-translate-y-1"
                  key={note.id}
                >
                  <div className="absolute top-4 right-4 opacity-50 hover:opacity-100">
                    <DeleteButton noteId={note.id} />
                  </div>
                  <a href={`/notebook/${note.id}`} key={note.id}>
                    <div className="border bodrer-stone-200 rounded-lg overflow-hidden flex flex-col">
                      <Image
                        width={300}
                        height={200}
                        alt={note.name}
                        src={note.imageUrl!}
                        objectFit="fill"
                        className="p-4 object-contain w-[300px] h-[200px] m-auto"
                      />
                      <div className="p-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {note.name}
                        </h3>
                        <div className="h-1"></div>
                        <p className="text-sm text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;