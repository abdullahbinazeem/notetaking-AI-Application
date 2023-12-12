import React from "react";
import { db } from "@/lib/db";
import { $notes } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq, and } from "drizzle-orm";

export async function generateMetadata({
  params,
}: {
  params: { noteId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    return {
      title: "Notes",
    };
  }

  const notes = await db
    .select()
    .from($notes)
    .where(
      and(eq($notes.id, parseInt(params.noteId)), eq($notes.userId, userId))
    );

  return {
    title: notes[0]?.name || "Notes",
  };
}

const BoardIdLayout = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export default BoardIdLayout;
