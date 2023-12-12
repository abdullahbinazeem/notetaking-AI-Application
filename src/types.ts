export interface ListWithCards {
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
}
