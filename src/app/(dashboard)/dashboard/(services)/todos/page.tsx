import React from "react";
import CreateBoardDialog from "./_components/CreateBoardDialog";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { $board } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import Image from "next/image";
import DeleteButton from "./_components/DeleteButton";

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <CreateBoardDialog />
        {boards.map((board) => {
          return (
            <div
              className="relative  hover:shadow-xl transition hover:-translate-y-1"
              key={board.id}
            >
              <div className="z-10 absolute top-2 right-2 opacity-50 hover:opacity-100">
                <DeleteButton boardId={board.id} />
              </div>
              <a href={`/board/${board.id}`} key={board.id}>
                <div
                  style={{ backgroundImage: `url(${board.imageUrl})` }}
                  className=" group  aspect-video bg-no-repeat bg-center bg-cover bg-sky-700 rounded-sm h-full w-full p-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />
                  <h3 className="relative text-lg font-semibold text-white">
                    {board.title}
                  </h3>
                  <h3 className="relative text-xs text-white">
                    {new Date(board.createdAt).toLocaleDateString()}
                  </h3>
                </div>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodosPage;
