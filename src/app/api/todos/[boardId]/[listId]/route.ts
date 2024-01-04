import { db } from "@/lib/db";
import { $list } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const deletedCard = await db
      .delete($list)
      .where(eq($list.id, parseInt(params.listId)))
      .returning({ deletedId: $list.id });

    return NextResponse.json({
      deletedId: deletedCard,
    });
  } catch (err) {
    return NextResponse.json({ error: err });
  }
}
