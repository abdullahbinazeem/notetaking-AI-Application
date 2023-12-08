"use client";

import React, { useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Loader2, Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { SingleImageDropzone } from "@/components/Edgestore/signgleImageDropzone";

import { useEdgeStore } from "@/lib/edgestore";

type Props = {};

const CreateBoardDialog = (props: Props) => {
  const [file, setFile] = useState<File>();
  const [input, setInput] = useState("");

  const { edgestore } = useEdgeStore();

  const router = useRouter();

  const createBoardbook = useMutation({
    mutationFn: async () => {
      if (file) {
        const res = await edgestore.publicFiles.upload({
          file,
        });

        const response = await axios.post("/api/notebook/createBoardBook", {
          name: input,
          imageUrl: res.url,
        });
        return response.data;
      }
      const response = await axios.post("/api/notebook/createBoardBook", {
        name: input,
      });
      return response.data;
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input === "" || file == null) {
      toast.error("You must fill in all input fields.");
      return;
    }

    createBoardbook.mutate(undefined, {
      onSuccess: ({ note_id }) => {
        toast.success(`New note created: ${input}`);
        console.log("create new note:", { note_id });
        router.push(`/notebook/${note_id}`);
        router.refresh();
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to create a new notebook");
      },
    });
  };

  return (
    <Dialog>
      <DialogTrigger>
        <div className="flex justify-center items-center gap-2 border-dashed border-2 border-green-600 h-full rounded-lg sm:flex-col hover:shadow-xl  transition hover:-translate-y-1 flex-row p-4">
          <Plus className="w-6 h-6 text-green-600" strokeWidth={3} />
          <h2 className="font-semibold text-green-600 sm:mt-2">New Board</h2>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Todo Board</DialogTitle>
          <DialogDescription>
            You can create a new board by clicking the button below
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Name..."
          />
          <div className="h-4"></div>
          <h3 className="my-4 text-s text-gray-500">Board Image</h3>
          <SingleImageDropzone
            width={300}
            height={200}
            value={file}
            onChange={(file) => {
              setFile(file);
            }}
            className="m-auto"
          />
          <div className="h-4"></div>
          <div className="flex item-center gap-2">
            <DialogClose className="text-sm bg-slate-100 py-2 px-4 rounded-md">
              Cancel
            </DialogClose>
            <Button
              className="bg-green-600"
              disabled={createBoardbook.isPending}
            >
              {createBoardbook.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBoardDialog;
