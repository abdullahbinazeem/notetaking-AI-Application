export interface ListWithCards {
  boardId: number | null;
  id: number;
  title: string;
  order: number;
  createdAt: Date;
  card: {
    id: number;
    title: string;
    task: string | null;
    order: number;
    listId: number | null;
    createdAt: Date;
  }[];
}
