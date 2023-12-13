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

type ListWithCards = {
  id: number;
  createdAt: Date;
  title: string;
  order: number;
  boardId: number | null;
  card: {
    id: number;
    createdAt: Date;
    title: string;
    order: number;
    task: string;
    listId: number | null;
  }[];
}[];

interface ListContainerProps {
  data: ListWithCards;
  boardId: string;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

const ListContainer = ({ data }: ListContainerProps) => {
  const router = useRouter();
  const params = useParams();

  const reorderList = useMutation({
    mutationFn: async (list: ListWithCards) => {
      const response = await axios.post(
        `/api/todos/${params.boardId}/reorder`,
        {
          list,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success(`List reorder!`);
      router.refresh();
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

    if (type == "list") {
      console.log(result);

      const items = reorder(orderedData, source.index, destination.index).map(
        (item, index) => ({ ...item, order: index })
      );

      setOrderedData(items);
      reorderList.mutate(items);
    }
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="lists" type="list" direction="horizontal">
        {(provided) => (
          <ol
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex gap-x-3 h-full"
          >
            {orderedData.map((list, index) => {
              return <ListItem key={list.id} index={index} data={list} />;
            })}
            {provided.placeholder}
            <ListForm />
            <div className="flex-shrink-0 w-1" />
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ListContainer;
