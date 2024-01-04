import { db } from "@/lib/db";
import { $board, $list } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const deletedBoard = await db
      .delete($board)
      .where(eq($board.id, parseInt(params.boardId)))
      .returning({ deletedId: $board.id });

    return NextResponse.json({
      deletedId: deletedBoard,
    });
  } catch (err) {
    return NextResponse.json({ error: err });
  }
}
