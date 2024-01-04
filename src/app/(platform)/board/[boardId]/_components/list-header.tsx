"use client";

import { toast } from "react-hot-toast";

import { useEventListener } from "usehooks-ts";
import { useState, useRef, ElementRef } from "react";
import { ListType } from "@/lib/db/schema";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import { Trash2Icon } from "lucide-react";

interface ListHeaderProps {
  data: ListType;
  onAddCard: () => void;
}

export const ListHeader = ({ data, onAddCard }: ListHeaderProps) => {
  const params = useParams();

  const [title, setTitle] = useState(data.title);
  const [isEditing, setIsEditing] = useState(false);

  const updateList = useMutation({
    mutationFn: async (updatedTitle: string) => {
      const response = await axios.post(
        `/api/todos/${params.boardId}/${data.id}/updateList`,
        {
          updatedTitle,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log(data);
      setTitle(data);
      toast.success("Succesfully update list to " + data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteList = useMutation({
    mutationFn: async () => {
      const response = await axios.delete(
        `/api/todos/${params.boardId}/${data.id}`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Successfully deleted list.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const handleSubmit = (formData: FormData) => {
    const updatedTitle = formData.get("title") as string;

    if (updatedTitle === data.title) {
      return disableEditing();
    }

    updateList.mutate(updatedTitle);
    return disableEditing();
  };

  const onBlur = () => {
    formRef.current?.requestSubmit();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      inputRef.current?.blur();
      formRef.current?.requestSubmit();
    }
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
  };

  useEventListener("keydown", onKeyDown);

  return (
    <div className="pt-2 px-2 text-sm font-semibold flex justify-between items-start- gap-x-2">
      {isEditing ? (
        <div className="flex justify-between w-full">
          <form ref={formRef} action={handleSubmit} className="flex-1 px-[2px]">
            <Input
              ref={inputRef}
              onBlur={onBlur}
              id="title"
              name="title"
              placeholder="Enter list title.."
              defaultValue={title}
              className="text-sm px-[7px] py-1 h-7 font-medium border-transparent hover:border-input focus:border-input transition truncate bg-transparent focus:bg-white"
            />
            <button type="submit" hidden />
          </form>
        </div>
      ) : (
        <div className="flex justify-between w-full">
          <div
            onClick={enableEditing}
            className=" cursor-pointer w-full text-sm px-2.5 py-1 h-7 font-medium border-transparent"
          >
            {title}
          </div>
        </div>
      )}
    </div>
  );
};
