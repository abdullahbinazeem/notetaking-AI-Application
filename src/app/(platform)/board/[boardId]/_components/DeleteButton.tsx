"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

type Props = {
  boardId: number;
  size?: string;
};

const DeleteButton = ({ boardId }: Props) => {
  const router = useRouter();
  const deleteNote = useMutation({
    mutationFn: async () => {
      const response = await axios.delete(`/api/todos/${boardId}`, {});
      return response.data;
    },
  });
  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          "p-2 bg-red-800 text-white rounded-md opacity-75 hover:opacity-100"
        )}
      >
        <Trash />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to DELETE this Todo board?
          </DialogTitle>
          <DialogDescription className="pt-4">
            This action cannot be undone. This will permanently delete your
            board and remove all to-dos and lists inside.
          </DialogDescription>
          <div className="h-4" />
          <DialogClose asChild>
            <Button
              variant={"destructive"}
              className="w-[50%] m-auto"
              onClick={() => {
                deleteNote.mutate(undefined, {
                  onSuccess: () => {
                    router.push("/dashboard/todos");
                    toast.success("Board deleted.");
                  },
                  onError: (err) => {
                    console.error(err);
                  },
                });
              }}
            >
              Delete
            </Button>
          </DialogClose>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteButton;
