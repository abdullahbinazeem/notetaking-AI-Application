"use client";
import React from "react";
import { Button } from "./ui/button";
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

type Props = {
  noteId: number;
  size?: string;
};

const DeleteButton = ({ noteId, size }: Props) => {
  const router = useRouter();
  const deleteNote = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/notebook/deleteNote", {
        noteId,
      });
      return response.data;
    },
  });
  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          "px-4 py-3 bg-red-800 text-white rounded-md",
          (size = "sm" ? "p-2" : "")
        )}
      >
        <Trash />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you wanna DELETE this note?</DialogTitle>
          <DialogDescription className="pt-4">
            This action cannot be undone. This will permanently delete your note
            and remove all AI contexts.
          </DialogDescription>
          <div className="h-4" />
          <DialogClose asChild>
            <Button
              variant={"destructive"}
              className="w-[50%] m-auto"
              onClick={() => {
                deleteNote.mutate(undefined, {
                  onSuccess: () => {
                    router.refresh();
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
