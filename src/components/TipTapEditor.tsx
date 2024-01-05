"use client";
import React, { useEffect, useMemo, useRef } from "react";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
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
import { Sparkles } from "lucide-react";

type Props = {
  note: NoteType;
};

const TipTapEditor = ({ note }: Props) => {
  const [editorState, setEditorState] = React.useState(
    note.editorState || `<h1>${note.name}</h1>`
  );

  const [editorText, setEditorText] = React.useState("");

  const { complete, completion, isLoading } = useCompletion({
    api: "/api/notebook/completion",
    onError: () => {
      toast.error(
        "Error with AI autocorrect. Take a break, you might have reached AI limit."
      );
    },
  });
  const saveNote = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/notebook/saveNote", {
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
          startAi(this.editor.getText().split("").slice(-100).join(" "));
          return true;
        },
      };
    },
  });

  const startAi = (prompt: string) => {
    console.log(prompt);
    if (prompt) {
      lastCompletion.current = "";

      complete(prompt);
      return;
    }
    return;
  };

  const editor = useEditor({
    autofocus: true,
    extensions: [StarterKit, customText],
    content: editorState,
    onUpdate: ({ editor }) => {
      setEditorState(editor.getHTML());
      setEditorText(editor.getText());
    },
    onCreate: ({ editor }) => {
      setEditorText(editor.getText());
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
    <div className="relative">
      <div className="flex gap-4">
        {editor && <TipTapMenuBar editor={editor} />}
        <Button disabled variant={"outline"}>
          {saveNote.isPending ? "Saving...." : "Saved"}
        </Button>
      </div>
      <div className="prose prose-sm w-full mt-4">
        <EditorContent editor={editor} />
        <div className="absolute bottom-12 left-0 right-0 flex justify-center ">
          <Button
            onClick={() => {
              startAi(editorText.split("").slice(-100).join(" "));
            }}
            disabled={isLoading}
            className="flex items-center gap-2 group rounded-full bg-green-600 transition hover:scale-105 hover:bg-green-700 "
          >
            <Sparkles /> <p>AI</p>
          </Button>
        </div>
      </div>
      <div className="h-24"></div>
      <span className="text-sm">
        Tip: Press
        <kbd className="mx-2 px-2 py-1.5 text-md font-semibold text-gray-800 bg-gray-100 border-gray-200 rounded-lg">
          &apos;Shift + :&apos;
        </kbd>
        for AI autocomplete
      </span>
    </div>
  );
};

export default TipTapEditor;
