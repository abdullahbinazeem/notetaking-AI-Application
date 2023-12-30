"use client";

import { toast } from "react-hot-toast";
import { Loader, Loader2, Plus, X } from "lucide-react";
import { forwardRef, useRef, ElementRef, KeyboardEventHandler } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOnClickOutside, useEventListener } from "usehooks-ts";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Input } from "@/components/ui/input";

interface CardFormProps {
  listId: number;
  enableEditing: () => void;
  disableEditing: () => void;
  isEditing: boolean;
}

export const CardForm = forwardRef<HTMLTextAreaElement, CardFormProps>(
  ({ listId, enableEditing, disableEditing, isEditing }, ref) => {
    const router = useRouter();
    const params = useParams();

    const formRef = useRef<ElementRef<"form">>(null);

    const createCard = useMutation({
      mutationFn: async (newCard: { title: string }) => {
        console.log(newCard);
        const response = await axios.post(
          `/api/todos/${params.boardId}/${listId}/createCard`,
          {
            title: newCard.title,
          }
        );
        return response.data;
      },
      onSuccess: (data) => {
        toast.success(`Card created`);
        disableEditing();
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        disableEditing();
      }
    };

    useOnClickOutside(formRef, disableEditing);
    useEventListener("keydown", onKeyDown);

    const onSubmit = (formData: FormData) => {
      const title = formData.get("title") as string;
      if (!title) {
        toast.error("Please fill in all required fields");
      }

      createCard.mutate({ title });
    };

    if (isEditing) {
      return (
        <form
          ref={formRef}
          action={onSubmit}
          className="m-1 py-0.5 px-1 space-y-4 mt-6"
        >
          <Textarea
            id="task"
            name="title"
            placeholder="Enter a Title for this card..."
            required
            disabled={createCard.isPending}
          />
          <div className="flex items-center gap-x-1">
            <Button type="submit" disabled={createCard.isPending}>
              Add card
              {createCard.isPending ? (
                <Loader2 className="ml-2 animate-spin w-5" />
              ) : (
                <div />
              )}
            </Button>
            <Button
              onClick={disableEditing}
              disabled={createCard.isPending}
              size="sm"
              variant="ghost"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </form>
      );
    }

    return (
      <div className="pt-2 px-2 mt-6">
        <Button
          onClick={enableEditing}
          className="h-auto px-2 py-1.5 w-full justify-start text-muted-foreground text-sm"
          size="sm"
          variant="ghost"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add a card
        </Button>
      </div>
    );
  }
);

CardForm.displayName = "CardForm";
