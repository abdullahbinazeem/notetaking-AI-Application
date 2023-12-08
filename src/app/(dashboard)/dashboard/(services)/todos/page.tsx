import React from "react";
import CreateBoardDialog from "./_components/CreateBoardDialog";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { $board } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const TodosPage = async () => {
  const { userId } = auth();
  const boards = await db
    .select()
    .from($board)
    .where(eq($board.userId, userId!));

  return (
    <div>
      {boards.length === 0 && (
        <div className="text-center">
          <h2 className="text-xl text-gray-500">You have no current Boards</h2>
        </div>
      )}
      <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 grid-cols-1 gap-x-3 gap-y-5">
        <CreateBoardDialog />
      </div>
    </div>
  );
};

export default TodosPage;
