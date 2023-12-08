import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const $notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("imageUrl"),
  userId: text("userId").notNull(),
  editorState: text("editorState"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const $board = pgTable("board", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("imageUrl"),
  userId: text("userId").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const boardRelations = relations($board, ({ many }) => ({
  lists: many($list),
}));

export const $list = pgTable("list", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  order: integer("order").notNull(),

  boardId: integer("boardId"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const listRelations = relations($list, ({ one, many }) => ({
  board: one($board, {
    fields: [$list.boardId],
    references: [$board.id],
  }),
  card: many($card),
}));

export const $card = pgTable("card", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  task: text("task").notNull(),

  listId: integer("listId"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cardRelations = relations($card, ({ one }) => ({
  lists: one($list, {
    fields: [$card.listId],
    references: [$list.id],
  }),
}));

export type NoteType = typeof $notes.$inferInsert;
