"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { CardType } from "@/lib/db/schema";
import { Draggable } from "@hello-pangea/dnd";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Calendar, CheckCircle2, LayoutDashboard, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { ElementRef, useRef, useState } from "react";
import toast from "react-hot-toast";

interface CardItemProps {
  data: CardType;
  index: number;
  list: string;
}

export const CardItem = ({ data, index, list }: CardItemProps) => {
  const params = useParams();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const textArea = useRef<ElementRef<"textarea">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

  const [task, setTask] = useState(data.task);
  const [title, setTitle] = useState(data.title);

  const updateCard = useMutation({
    mutationFn: async (card: { task?: string; title?: string }) => {
      const response = await axios.post(
        `/api/todos/${params.boardId}/${data.listId}/${data.id}/updateCard`,
        {
          card,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setTask(data.task);
      setTitle(data.title);
      toast.success("Succesfully update card");
      disableEditing();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textArea.current?.focus();
      textArea.current?.select();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!textArea.current?.value && !inputRef.current?.value) {
      return setIsEditing(false);
    }

    if (
      textArea.current?.value == task &&
      inputRef.current?.value == title.trim()
    ) {
      return setIsEditing(false);
    }

    updateCard.mutate({
      task: textArea.current?.value == task ? task : textArea.current?.value,
      title:
        inputRef.current?.value == title.trim()
          ? title
          : inputRef.current?.value,
    });
  };

  return (
    <Draggable draggableId={"card:" + data.id!.toString()} index={index}>
      {(provided) => (
        <div className="">
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            role="button"
            className="truncate border-2 border-transparent hover:border-black py-2 px-3 text-sm bg-white rounded-md shadow-sm"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            {title}
          </div>
          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open);
              setIsEditing(false);
            }}
          >
            <DialogContent className="max-w-5xl pl-6">
              <DialogHeader className="mb-10">
                <div className="flex gap-10 mb-2">
                  <div className="flex flex-row gap-4 items-center">
                    <LayoutDashboard />

                    {isEditing ? (
                      <Input
                        ref={inputRef}
                        id="title"
                        name="title"
                        placeholder="Enter list title.."
                        defaultValue={title}
                        className="text-2xl p-2  font-semibold leading-none tracking-tight"
                      />
                    ) : (
                      <DialogTitle
                        className="text-2xl p-2  cursor-pointer"
                        onClick={() => {
                          setIsEditing(true);
                        }}
                      >
                        {title}
                      </DialogTitle>
                    )}
                  </div>
                </div>
                <p className="text-black underline">
                  <span className="text-gray-600">List:</span> {list}
                </p>
                <div className="flex flex-row gap-2 items-center">
                  <Calendar size={16} />
                  {data.createdAt?.toLocaleDateString()}
                </div>
              </DialogHeader>
              <div>
                <div className="flex flex-row gap-2 items-center text-black">
                  <CheckCircle2 />
                  <h1 className="text-xl">Task:</h1>
                </div>
                <br />
                {isEditing ? (
                  <>
                    <form
                      onSubmit={handleSubmit}
                      className="flex-1 px-[2px] transition-all"
                    >
                      <Textarea
                        ref={textArea}
                        id="task"
                        name="task"
                        placeholder="Enter task..."
                        defaultValue={task || undefined}
                        className="text-sm mb-4 rounded-xl p-4 text-black w-full min-h-[200px] max-h-[400px] bg-gray-200 border-transparent hover:border-input focus:border-input transition"
                      ></Textarea>
                      <Button
                        variant={"default"}
                        type="submit"
                        className="bg-green-600 hover:bg-green-500"
                      >
                        Save
                        {updateCard.isPending ? (
                          <Loader2 className="animate-spin ml-2" />
                        ) : (
                          <div></div>
                        )}
                      </Button>
                      <Button
                        variant={"ghost"}
                        onClick={disableEditing}
                        type="reset"
                        className="ml-2"
                      >
                        Stop Editing
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <div
                      className=" mb-4 rounded-xl p-4 text-black w-full h-[200px]  bg-gray-200 cursor-pointer overflow-y-scroll "
                      onClick={enableEditing}
                    >
                      {task ? (
                        <p className="break-all text-pretty whitespace-pre-wrap  text-sm font-normal tracking-tighter ">
                          {task}
                        </p>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500 font-normal tracking-tighter ">
                            Enter a task...
                          </p>
                        </>
                      )}
                    </div>
                    <Button variant={"ghost"}>Saved</Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Draggable>
  );
};
