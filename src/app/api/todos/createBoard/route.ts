// /api/todos/createBoard

import { db } from "@/lib/db";
import { $board } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { title, imageUrl } = body;

  const note_ids = await db
    .insert($board)
    .values({
      title,
      userId,
      imageUrl,
    })
    .returning({
      insertedId: $board.id,
    });

  return NextResponse.json({
    note_id: note_ids[0].insertedId,
  });
}
