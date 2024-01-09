"use client";
import React, { useEffect, useRef } from "react";
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
import { MoreVertical, Sparkles } from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type Props = {
  note: NoteType;
};

type style = "" | "Academic" | "Formal" | "Casual" | "Slang";
type length = "" | "Short" | "Regular" | "Long";

const TipTapEditor = ({ note }: Props) => {
  const [editorState, setEditorState] = React.useState(
    note.editorState || `<h1>${note.name}</h1>`
  );

  const [editorText, setEditorText] = React.useState("");

  const [AiLength, setAiLength] = React.useState<length>("Short");
  const [AiStyle, setAiStyle] = React.useState<style>("Casual");

  const { complete, completion, isLoading } = useCompletion({
    api: "/api/notebook/completion",
    body: {
      length: AiLength,
      AiStyle: AiStyle,
    },
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
      <div className="flex gap-2 mb-6 text-sm">
        <div className="bg-blue-500 text-white px-2 py-1 rounded-full inline-block">
          {AiLength}
        </div>
        <div className="bg-purple-500 text-white px-2 py-1 rounded-full inline-block">
          {AiStyle}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-6">
        {editor && <TipTapMenuBar editor={editor} />}
        <Button
          disabled
          variant={"outline"}
          className={
            saveNote.isPending ? "bg-green-500 text-black" : "text-black"
          }
        >
          {saveNote.isPending ? "Saving...." : "Saved"}
        </Button>
      </div>
      <div className="prose prose-sm w-full mt-4">
        <EditorContent editor={editor} />
        <div className="absolute bottom-4 sm:bottom-16 left-0 right-0 flex justify-center items-center gap-1">
          <Button
            onClick={() => {
              startAi(editorText.split("").slice(-100).join(" "));
            }}
            disabled={isLoading}
            className="flex items-center gap-2 group rounded-full bg-green-600 transition hover:scale-105 hover:bg-green-700 "
          >
            <Sparkles /> <p>AI</p>
          </Button>
          <Drawer>
            <DrawerTrigger className="flex items-center hover:bg-slate-200 pr-2 transition-all rounded-md">
              <MoreVertical /> <p className="text-xs font">AI Settings</p>
            </DrawerTrigger>
            <DrawerContent className="min-h-[50vh]">
              <div className="mx-auto w-full max-w-4xl">
                <DrawerHeader>
                  <DrawerTitle className="text-xl md:text-2xl">
                    AI Options
                  </DrawerTitle>
                  <DrawerDescription>
                    Customize your AI Automplete companion!
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-4 mb-4 flex gap-4 justify-between items-start">
                  <div className="basis-1/2">
                    <h2 className="md:text-lg mb-2">Autocomplete Length:</h2>
                    <div className="flex flex-wrap gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAiLength("Short");
                        }}
                        className={
                          AiLength == "Short"
                            ? "bg-green-500 hover:bg-green-500 hover:text-white text-white transition-all "
                            : "border-2 transition-all"
                        }
                      >
                        Short
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAiLength("Regular");
                        }}
                        className={
                          AiLength == "Regular"
                            ? "bg-green-500 hover:bg-green-500 hover:text-white text-white transition-all "
                            : "border-2 transition-all"
                        }
                      >
                        Regular
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAiLength("Long");
                        }}
                        className={
                          AiLength == "Long"
                            ? "bg-green-500 hover:bg-green-500 hover:text-white text-white transition-all "
                            : "border-2 transition-all"
                        }
                      >
                        Long
                      </Button>
                    </div>
                  </div>
                  <div className="basis-2/3 w-full bg-slate-200 p-2 rounded-lg self-stretch min-h-[80px] sm:min-h-[130px]">
                    <p className="text-slate-600 font-medium text-xs sm:text-sm ">
                      <span className="text-slate-800 font-regular">Nasa</span>
                      {AiLength == "Short" &&
                        " is an organization that explores space."}
                      {AiLength == "Regular" &&
                        ", also known as the National Aeronautics and Space Administration, is a U.S. government agency that explores space."}
                      {AiLength == "Long" &&
                        ", which stands for the National Aeronautics and Space Administration, is a government agency that explores space and conducts research. They send astronauts to the moon and discover new things about our universe. They're like space superheroes, helping us learn more about the cosmos!"}
                    </p>
                  </div>
                </div>
                <div className="p-4 mb-4 flex gap-4 justify-between items-start">
                  <div className="basis-1/2">
                    <h2 className="md:text-lg mb-2">AI Style:</h2>
                    <div className="flex gap-4 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAiStyle("Casual");
                        }}
                        className={
                          AiStyle == "Casual"
                            ? "bg-green-500 hover:bg-green-500 hover:text-white text-white transition-all "
                            : "border-2 transition-all"
                        }
                      >
                        Casual
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAiStyle("Academic");
                        }}
                        className={
                          AiStyle == "Academic"
                            ? "bg-green-500 hover:bg-green-500 hover:text-white text-white transition-all "
                            : "border-2 transition-all"
                        }
                      >
                        Academic
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAiStyle("Formal");
                        }}
                        className={
                          AiStyle == "Formal"
                            ? "bg-green-500 hover:bg-green-500 hover:text-white text-white transition-all "
                            : "border-2 transition-all"
                        }
                      >
                        Formal
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAiStyle("Slang");
                        }}
                        className={
                          AiStyle == "Slang"
                            ? "bg-green-500 hover:bg-green-500 hover:text-white text-white transition-all "
                            : "border-2 transition-all"
                        }
                      >
                        Slang
                      </Button>
                    </div>
                  </div>
                  <div className="basis-2/3 w-full bg-slate-200 p-2 rounded-lg self-stretch min-h-[80px] sm:min-h-[130px] ">
                    <p className="text-slate-600 font-medium text-xs sm:text-sm ">
                      <span className="text-slate-800 font-regular">Nasa</span>
                      {AiStyle == "Casual" &&
                        " is an organization that explores space and conducts scientific research, like sending astronauts to the moon and studying other planets."}
                      {AiStyle == "Academic" &&
                        " plays a crucial role in space exploration and scientific research, pushing the boundaries of human knowledge and inspiring future generations. [source - https://www.nasa.gov/]"}
                      {AiStyle == "Formal" &&
                        ", the renowned space exploration agency, has continuously pushed the boundaries of human knowledge and expanded our understanding of the universe."}
                      {AiStyle == "Slang" &&
                        " is making moves and exploring the unknown like a boss, pushin' boundaries and expanding our cosmic knowledge."}
                    </p>
                  </div>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
      <div className="h-24"></div>
      <span className="text-sm sm:block hidden">
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
