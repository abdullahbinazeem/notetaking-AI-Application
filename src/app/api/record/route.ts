// /api/todos/createBoard

import { db } from "@/lib/db";
import { $record } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { user, message } = body;

  const record_ids = await db
    .insert($record)
    .values({
      name: user,
      AIrequest: message,
    })
    .returning({
      insertedId: $record.id,
    });

  return NextResponse.json({
    record_id: record_ids[0].insertedId,
  });
}
