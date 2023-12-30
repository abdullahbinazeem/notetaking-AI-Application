import { db } from "@/lib/db";
import { $list } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { and, asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import ListContainer from "./_components/list-container";

interface BoardIdPageProps {
  params: {
    boardId: string;
  };
}

const BoardPage = async ({ params }: BoardIdPageProps) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/dashboard");
  }

  const lists = await db.query.$list.findMany({
    where: eq($list.boardId, parseInt(params.boardId)),
    with: {
      card: {
        orderBy: (card, { asc }) => [asc(card.order)],
      },
    },
  });

  return (
    <div className="p-4 h-full overflow-x-auto">
      <ListContainer boardId={params.boardId} data={lists} />
    </div>
  );
};

export default BoardPage;
