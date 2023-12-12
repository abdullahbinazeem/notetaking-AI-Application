// /api/todos/createBoard

import { db } from "@/lib/db";
import { $board, $list } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

interface BoardIdParams {
  params: {
    boardId: string;
  };
}

export async function POST(req: Request, { params }: BoardIdParams) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.boardId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title } = body;

    if (!title) {
      return new NextResponse("No title provided", { status: 401 });
    }

    const board = await db.query.$board.findFirst({
      where: and(
        eq($board.userId, userId),
        eq($board.id, parseInt(params.boardId))
      ),
    });

    if (!board) {
      return new NextResponse("Board not found", { status: 401 });
    }

    const lastList = await db.query.$list.findFirst({
      where: eq($list.boardId, parseInt(params.boardId)),
      orderBy: [desc($list.order)],
      columns: {
        order: true,
      },
    });

    const newOrder = lastList ? lastList.order + 1 : 1;

    const list_ids = await db
      .insert($list)
      .values({
        boardId: parseInt(params.boardId),
        title,
        order: newOrder,
      })
      .returning({ insertedId: $list.id });

    return NextResponse.json({
      list_id: list_ids[0].insertedId,
    });
  } catch (error) {
    return {
      error,
    };
  }
}
