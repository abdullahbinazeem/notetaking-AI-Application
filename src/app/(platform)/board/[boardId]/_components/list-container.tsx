"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DragDropContext, Droppable } from "@hello-pangea/dnd";

import { ListForm } from "./list-form";
import { ListItem } from "./list-item";
import { useMutation } from "@tanstack/react-query";

import toast from "react-hot-toast";
import axios from "axios";
import { Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardType } from "@/lib/db/schema";
import { ListWithCards } from "@/types";

interface ListContainerProps {
  data: ListWithCards[];
  boardId: string;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

const ListContainer = ({ data }: ListContainerProps) => {
  const params = useParams();
  const [type, setType] = useState("card");

  const reorderList = useMutation({
    mutationFn: async (list: ListWithCards[]) => {
      const response = await axios.post(
        `/api/todos/${params.boardId}/reorderList`,
        {
          list,
        }
      );
      return response.data;
    },
    onSuccess: () => {},
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const reorderCard = useMutation({
    mutationFn: async (card: CardType[]) => {
      const response = await axios.post(
        `/api/todos/${params.boardId}/reorderCard`,
        {
          card,
        }
      );
      return response.data;
    },
    onSuccess: () => {},
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteList = useMutation({
    mutationFn: async (list: { listId: string }) => {
      const response = await axios.delete(
        `/api/todos/${params.boardId}/${list.listId}`
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Successfully deleted list.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteCard = useMutation({
    mutationFn: async (deleteCard: { listId: string; cardId: string }) => {
      const response = await axios.delete(
        `/api/todos/${params.boardId}/${deleteCard.listId}/${deleteCard.cardId}`
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Successfully deleted card.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [orderedData, setOrderedData] = useState(data);

  useEffect(() => {
    setOrderedData(data);
  }, [data]);

  const onDragEnd = (result: any) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    // if dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (destination.droppableId === "trash") {
      if (type == "card") {
        let newOrderedData = [...orderedData];

        const sourceList = newOrderedData.find(
          (list) => list.id.toString() === source.droppableId
        );

        if (!sourceList) {
          return;
        }

        if (!sourceList.card) {
          sourceList.card = [];
        }

        const [removedCard] = sourceList?.card.splice(source.index, 1);
        if (!removedCard.listId) {
          return;
        }
        setOrderedData(newOrderedData);

        deleteCard.mutate({
          listId: removedCard.listId.toString(),
          cardId: removedCard.id.toString(),
        });
        return;
      }
      if (type == "list") {
        let newOrderedData = Array.from(orderedData);
        const [removedList] = newOrderedData?.splice(source.index, 1);

        setOrderedData(newOrderedData);

        deleteList.mutate({
          listId: removedList.id.toString(),
        });

        return;
      }
    }

    if (type == "list") {
      const items = reorder(orderedData, source.index, destination.index).map(
        (item, index) => ({ ...item, order: index })
      );

      setOrderedData(items);
      reorderList.mutate(items);
    }

    if (type == "card") {
      let newOrderedData = [...orderedData];

      const sourceList = newOrderedData.find(
        (list) => list.id.toString() === source.droppableId
      );
      const destList = newOrderedData.find(
        (list) => list.id.toString() === destination.droppableId
      );

      if (!sourceList || !destList) {
        return;
      }

      // Check if cards exists on the sourceList
      if (!sourceList.card) {
        sourceList.card = [];
      }

      // Check if cards exists on the destList
      if (!destList.card) {
        destList.card = [];
      }

      if (source.droppableId === destination.droppableId) {
        const reorderedCards = reorder(
          sourceList.card,
          source.index,
          destination.index
        );

        reorderedCards.forEach((item, idx) => {
          item.order = idx;
        });

        sourceList.card = reorderedCards;
        setOrderedData(newOrderedData);
        reorderCard.mutate(reorderedCards);
      } else {
        // Remove card from the source list
        const [movedCard] = sourceList.card.splice(source.index, 1);

        // Assign the new listId to the moved card
        movedCard.listId = destination.droppableId;

        // Add card to the destination list
        destList.card.splice(destination.index, 0, movedCard);

        sourceList.card.forEach((item, idx) => {
          item.order = idx;
        });

        // Update the order for each card in the destination list
        destList.card.forEach((item, idx) => {
          item.order = idx;
        });

        setOrderedData(newOrderedData);
        reorderCard.mutate(destList.card);
      }
    }
  };

  const onBeforeCapture = (result: any) => {
    setType(result.draggableId.split(":")[0]);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd} onBeforeCapture={onBeforeCapture}>
      <Droppable droppableId="lists" type="list" direction="horizontal">
        {(provided) => (
          <div {...provided.droppableProps}>
            <ol ref={provided.innerRef} className="mt-10 flex gap-x-3 h-full">
              {orderedData.map((list, index) => {
                return (
                  <ListItem key={"list:" + list.id} index={index} data={list} />
                );
              })}
              {provided.placeholder}
              <ListForm />
              <div className="flex-shrink-0 w-1" />
            </ol>
          </div>
        )}
      </Droppable>
      <Droppable
        ignoreContainerClipping
        droppableId="trash"
        type={type}
        direction="vertical"
      >
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cn(
              "list-none left-0 right-0 my-0 pt-0 m-auto w-[90vw] scale-95 fixed h-[150px] bg-red-50 mt-40 border-red-400 border-2 border-dashed rounded-xl transition",
              snapshot.isDraggingOver
                ? "scale-105 overflow-hidden bg-red-200 border-red-800"
                : ""
            )}
          >
            {provided.placeholder}
            <div className="transition-all w-fit h-fit inline-block absolute top-0 bottom-0 left-0 right-0 m-auto">
              {snapshot.isDraggingOver ? (
                <>
                  <Trash2
                    className="text-red-900 m-auto mb-2"
                    size={32}
                    strokeWidth={1.3}
                  />
                  <p className="text-red-900 ">
                    This will permanentely delete your {type}!
                  </p>
                </>
              ) : (
                <>
                  <Trash2
                    className="text-red-900 m-auto mb-2"
                    size={32}
                    strokeWidth={1.3}
                  />
                  <p className="text-red-500">Drag Lists or Cards to remove</p>
                </>
              )}
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ListContainer;
