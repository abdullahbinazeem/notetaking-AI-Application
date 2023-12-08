import React from "react";
import Image from "next/image";

import { auth } from "@clerk/nextjs";

import { eq } from "drizzle-orm";
import { $notes } from "@/lib/db/schema";
import { db } from "@/lib/db";

import CreateNoteDialog from "@/components/CreateNoteDialog";
import DeleteButton from "@/components/DeleteButton";
const DashboardPage = async () => {
  const { userId } = auth();
  const notes = await db
    .select()
    .from($notes)
    .where(eq($notes.userId, userId!));

  return (
    <>
      {/* display all the notes */}
      {notes.length === 0 && (
        <div className="text-center">
          <h2 className="text-xl text-gray-500">You have no Notes yet.</h2>
        </div>
      )}
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
                <div className="border border-stone-200 rounded-lg overflow-hidden flex flex-col">
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
    </>
  );
};

export default DashboardPage;
