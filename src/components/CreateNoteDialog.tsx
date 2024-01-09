"use client";

import React, { useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "./ui/dialog";
import { Input } from "./ui/input";

import { Loader2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { SingleImageDropzone } from "./Edgestore/signgleImageDropzone";

import { useEdgeStore } from "@/lib/edgestore";

import bg1 from "@/public/bg_1.jpg";
import bg2 from "@/public/bg_2.jpg";
import bg3 from "@/public/bg_3.jpg";
import bg4 from "@/public/bg_4.jpg";
import bg5 from "@/public/bg_5.jpg";
import bg6 from "@/public/bg_6.jpg";
import { cn } from "@/lib/utils";

const DefaultImages = [bg1, bg6, bg5, bg2, bg3, bg4];

const CreateNoteDialog = () => {
  const [file, setFile] = useState<File>();
  const [defaultFile, setDefaultFile] = useState<String>();

  const [input, setInput] = useState("");

  const { edgestore } = useEdgeStore();

  const router = useRouter();

  const createNotebook = useMutation({
    mutationFn: async () => {
      if (file) {
        const res = await edgestore.publicFiles.upload({
          file,
        });

        const response = await axios.post("/api/notebook/createNoteBook", {
          name: input,
          imageUrl: res.url,
        });
        return response.data;
      }
      if (defaultFile) {
        const response = await axios.post("/api/notebook/createNoteBook", {
          name: input,
          imageUrl: defaultFile,
        });
        return response.data;
      }
      const response = await axios.post("/api/notebook/createNoteBook", {
        name: input,
      });
      return response.data;
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input === "" || (file == null && defaultFile == "")) {
      toast.error("You must fill in all input fields.");
      return;
    }

    createNotebook.mutate(undefined, {
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
          <h2 className="font-semibold text-green-600 sm:mt-2">
            New Note Book
          </h2>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Study notes</DialogTitle>
          <DialogDescription>
            You can create a new note by clicking the button below
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Name..."
          />
          <div className="h-4"></div>
          <h3 className="my-4 text-s text-gray-500">Note Image</h3>
          <div className="grid grid-cols-3 gap-4">
            {DefaultImages.map((image) => (
              <div
                key={image.src}
                onClick={() => {
                  if (defaultFile == image.src) {
                    setDefaultFile("");
                  } else {
                    setDefaultFile(image.src);
                    setFile(undefined);
                  }
                }}
              >
                <Image
                  width={200}
                  height={200}
                  alt="bg-image1"
                  src={image}
                  className={cn(
                    "aspect-[4/3] object-cover w-full rounded-sm opacity-70 transition-opacity",
                    defaultFile == image.src
                      ? " outline outline-offset-1 outline-2 outline-blue-500  opacity-100"
                      : ""
                  )}
                />
              </div>
            ))}
          </div>
          <SingleImageDropzone
            width={200}
            height={150}
            value={file}
            onChange={(file) => {
              setFile(file);
              setDefaultFile("");
            }}
            className="m-auto mt-10"
          />
          <div className="h-4"></div>
          <div className="flex item-center gap-2">
            <DialogClose className="text-sm bg-slate-100 py-2 px-4 rounded-md">
              Cancel
            </DialogClose>
            <Button
              className="bg-green-600"
              disabled={createNotebook.isPending}
            >
              {createNotebook.isPending && (
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

export default CreateNoteDialog;
