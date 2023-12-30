// /api/todos/createBoard

import { db } from "@/lib/db";
import { $card, $list } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

interface reorderParams {
  params: {
    boardId: string;
  };
}

export async function POST(req: Request, { params }: reorderParams) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { card } = body;

    if (!card) {
      return new NextResponse("No cards provided", { status: 401 });
    }

    const list = await db.query.$list.findMany({
      where: and(
        eq($list.id, parseInt(card[0].listId)),
        eq($list.boardId, parseInt(params.boardId))
      ),
    });

    if (!list) {
      return new NextResponse("Invalid List", { status: 401 });
    }

    for (let item of card) {
      await db
        .update($card)
        .set({ order: item.order, listId: item.listId })
        .where(and(eq($card.id, item.id)));
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error,
    });
  }
}
