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
  };
}

export async function POST(req: Request, { params }: reorderParams) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { updatedTitle } = body;
    console.log(body);
    if (!updatedTitle) {
      return new NextResponse("No title provided", { status: 401 });
    }

    const updateList = await db
      .update($list)
      .set({ title: updatedTitle })
      .where(
        and(
          eq($list.id, parseInt(params.listId)),
          eq($list.boardId, parseInt(params.boardId))
        )
      )
      .returning({ title: $list.title });

    return NextResponse.json(updateList[0].title, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error,
    });
  }
}
