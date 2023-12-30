import { db } from "@/lib/db";
import { $card } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { listId: string; cardId: string } }
) {
  try {
    const deletedCard = await db
      .delete($card)
      .where(eq($card.id, parseInt(params.cardId)))
      .returning({ deletedId: $card.id });

    return NextResponse.json({
      deletedId: deletedCard,
    });
  } catch (err) {
    return NextResponse.json({ error: err });
  }
}
