import React from "react";
import { db } from "@/lib/db";
import { $board } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq, and } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { clerk } from "@/lib/clerk-server";
import DeleteButton from "./_components/DeleteButton";

export async function generateMetadata({
  params,
}: {
  params: { boardId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    return {
      title: "Todo Board",
    };
  }

  const boards = await db
    .select()
    .from($board)
    .where(
      and(eq($board.id, parseInt(params.boardId)), eq($board.userId, userId))
    );

  return {
    title: boards[0]?.title || "Board",
  };
}

const BoardIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { boardId: string };
}) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/dashboard");
  }
  const user = await clerk.users.getUser(userId);

  const boards = await db
    .select()
    .from($board)
    .where(
      and(eq($board.id, parseInt(params.boardId)), eq($board.userId, userId))
    );

  if (boards.length != 1) {
    return redirect("/dashboard");
  }

  const board = boards[0];

  return (
    <div className="min-h-screen grainy p-8">
      <div className="max-w-4xl mx-auto border shadow-xl border-stone-200 rouned-lg p-4  items-center flex justify-between">
        <div className="flex">
          <Link href="/dashboard/todos">
            <Button className="bg-green-600" size="sm">
              Back
            </Button>
          </Link>

          <div className="w-3"></div>
          <span className="font-semibold">
            {user.firstName}
            {user.lastName}
          </span>
          <span className="inline-block mx-1">/</span>
          <span className="text-stone-500 font-semibold">{board.title}</span>
        </div>
        <DeleteButton boardId={board.id} />
      </div>

      {children}
    </div>
  );
};

export default BoardIdLayout;
