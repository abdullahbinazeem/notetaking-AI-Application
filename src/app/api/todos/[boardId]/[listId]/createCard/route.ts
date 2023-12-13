// /api/todos/createBoard

import { db } from "@/lib/db";
import { $board, $card, $list } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

interface CardParams {
  params: {
    boardId: string;
    listId: string;
  };
}

export async function POST(req: Request, { params }: CardParams) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.boardId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.listId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, task } = body;

    if (!title) {
      return new NextResponse("No title provided", { status: 401 });
    }

    if (!task) {
      return new NextResponse("No task provided", { status: 401 });
    }

    const list = await db.query.$list.findFirst({
      where: and(eq($list.boardId, parseInt(params.boardId))),
    });

    if (!list) {
      return new NextResponse("List not found", { status: 401 });
    }

    const lastCard = await db.query.$card.findFirst({
      where: eq($card.listId, parseInt(params.listId)),
      orderBy: [desc($list.order)],
      columns: {
        order: true,
      },
    });

    const newOrder = lastCard ? lastCard.order + 1 : 1;

    const card_ids = await db
      .insert($card)
      .values({
        task,
        title,
        listId: parseInt(params.listId),
        order: newOrder,
      })
      .returning({ insertedId: $list.id });

    return NextResponse.json({
      card_ids: card_ids[0].insertedId,
    });
  } catch (error) {
    return NextResponse.json({
      error,
    });
  }
}
