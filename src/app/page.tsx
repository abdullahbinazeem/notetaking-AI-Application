import TypewriterTitle from "@/components/TypewriterTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className=" bg-gradient-to-r min-h-screen from-rose-100 to-teal-100 grainy">
      <div className="h-screen w-screen grid place-content-center">
        <h1 className="font-semibold text-5xl text-center">
          <span className="text-green-600 font-bold text-7xl">Studily</span>{" "}
          your AI assistant.
        </h1>
        <div className="mt-4">
          <h2 className="font-semibold text-3xl text-center text-slate-700">
            <TypewriterTitle />
          </h2>
        </div>
        <div className="mt-8"></div>

        <div className="flex justify-center">
          <Link href="/dashboard/notes">
            <Button className="bg-green-600" size="sm">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" strokeWidth={3} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
