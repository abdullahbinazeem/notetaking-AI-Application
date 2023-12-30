// /api/todos/createBoard

import { db } from "@/lib/db";
import { $list } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { list } = body;

    if (!list) {
      return new NextResponse("No list provided", { status: 401 });
    }

    for (let item of list) {
      await db
        .update($list)
        .set({ order: item.order })
        .where(eq($list.id, item.id));
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error,
    });
  }
}
