"use client";
import React, { useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import TipTapMenuBar from "./TipTapMenuBar";
import { Button } from "./ui/button";
import { useDebounce } from "@/lib/useDebouce";
import { useMutation } from "@tanstack/react-query";
import Text from "@tiptap/extension-text";
import axios from "axios";
import { NoteType } from "@/lib/db/schema";
import toast from "react-hot-toast";
import { useCompletion } from "ai/react";

type Props = {
  note: NoteType;
};

const TipTapEditor = ({ note }: Props) => {
  const [editorState, setEditorState] = React.useState(
    note.editorState || `<h1>${note.name}</h1>`
  );
  const { complete, completion } = useCompletion({
    api: "/api/completion",
    onError: () => {
      toast.error(
        "Error with AI autocorrect. Take a break, you might have reached AI limit."
      );
    },
  });
  const saveNote = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/saveNote", {
        noteId: note.id,
        editorState: editorState,
      });
      return response.data;
    },
  });
  const customText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Shift-:": () => {
          // take the last 30 words
          lastCompletion.current = "";
          const prompt = this.editor.getText().split("").slice(-100).join(" ");

          complete(prompt);
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: true,
    extensions: [StarterKit, customText],
    content: editorState,
    onUpdate: ({ editor }) => {
      setEditorState(editor.getHTML());
    },
  });
  const lastCompletion = useRef("");

  useEffect(() => {
    if (!editor) return;
    if (!completion) {
      return;
    }
    console.log(lastCompletion.current);
    const diff = completion.slice(lastCompletion.current.length);
    lastCompletion.current = completion;

    console.log(completion);
    editor?.chain().setBold().setItalic().run();
    editor?.chain().insertContent(diff).run();
  }, [completion, editor]);

  const debouncedEditorState = useDebounce(editorState, 1200);
  useEffect(() => {
    if (debouncedEditorState === "") return;
    saveNote.mutate(undefined, {
      onSuccess: (data) => {
        console.log("success update!", data);
      },
      onError: (err) => {
        console.error(err);
        toast.success("Update failed");
      },
    });
    editor?.chain().unsetBold().unsetItalic().run();
  }, [debouncedEditorState, editor]);

  return (
    <>
      <div className="flex">
        {editor && <TipTapMenuBar editor={editor} />}
        <Button disabled variant={"outline"}>
          {saveNote.isPending ? "Saving...." : "Saved"}
        </Button>
      </div>
      <div className="prose prose-sm w-full mt-4">
        <EditorContent editor={editor} />
      </div>
      <div className="h-4"></div>
      <span className="text-sm">
        Tip: Press
        <kbd className="mx-2 px-2 py-1.5 text-md font-semibold text-gray-800 bg-gray-100 border-gray-200 rounded-lg">
          &apos;Shift + :&apos;
        </kbd>
        for AI autocomplete
      </span>
    </>
  );
};

export default TipTapEditor;
