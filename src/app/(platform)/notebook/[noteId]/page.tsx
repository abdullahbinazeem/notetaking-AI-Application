import DeleteButton from "@/components/DeleteButton";
import TipTapEditor from "@/components/TipTapEditor";
import { Button } from "@/components/ui/button";
import { clerk } from "@/lib/clerk-server";
import { db } from "@/lib/db";
import { $notes } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import React from "react";

type Props = {
  params: {
    noteId: string;
  };
};

const NotebookPage = async ({ params: { noteId } }: Props) => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/dashboard");
  }
  const user = await clerk.users.getUser(userId);

  const notes = await db
    .select()
    .from($notes)
    .where(and(eq($notes.id, parseInt(noteId)), eq($notes.userId, userId)));

  if (notes.length != 1) {
    return redirect("/dashboard");
  }
  const note = notes[0];

  return (
    <div className="min-h-screen grainy p-8">
      <div className="max-w-4xl mx-auto">
        <div className="border shadow-xl border-stone-200 rouned-lg p-4 flex items-center">
          <Link href="/dashboard/notes">
            <Button className="bg-green-600" size="sm">
              Back
            </Button>
          </Link>
          <div className="w-3"></div>
          <span className="font-semibold sm:block hidden">
            {user.firstName}
            {user.lastName}
          </span>
          <span className="inline-block mx-1">/</span>
          <span className="text-stone-500 font-semibold sm:text-md text-sm">
            {note.name}
          </span>
          <div className="ml-auto">
            <DeleteButton size="sm" noteId={note.id} />
          </div>
        </div>
        <div className="h-4"></div>
        <div className="border-stone-200 shadow-xl border rounded-lg  px-6 sm:px-10 md:px-16 py-8 w-full">
          <TipTapEditor
            name={`${user.firstName} ${user.lastName}`}
            note={note}
          />
        </div>
      </div>
    </div>
  );
};

export default NotebookPage;
