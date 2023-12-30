// /api/todos/createBoard

import { db } from "@/lib/db";
import { $card, $list } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

interface reorderParams {
  params: {
    boardId: string;
    listId: string;
    cardId: string;
  };
}

export async function POST(req: Request, { params }: reorderParams) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const list = await db.query.$list.findMany({
      where: and(
        eq($list.id, parseInt(params.listId)),
        eq($list.boardId, parseInt(params.boardId))
      ),
    });

    if (!list) {
      return new NextResponse("Invalid List", { status: 401 });
    }

    const body = await req.json();
    const { card } = body;
    const { title, task } = card;

    console.log(card);

    if (!task && !title) {
      return new NextResponse("No update information provided", {
        status: 401,
      });
    }

    const updateCard = await db
      .update($card)
      .set({ task: task, title: title })
      .where(
        and(
          eq($card.id, parseInt(params.cardId)),
          eq($card.listId, parseInt(params.listId))
        )
      )
      .returning({ title: $card.title, task: $card.task });

    return NextResponse.json(updateCard[0], { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      error,
    });
  }
}
