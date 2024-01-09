import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { $record } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

const Admin = async () => {
  const { userId } = auth();

  if (userId != "user_2aham3WVFCXnibMRJS4p79uOep0") {
    redirect("/dashboard/notes");
  }

  const record = await db.query.$record.findMany({
    orderBy: [desc($record.createdAt)],
  });
  return (
    <div className=" bg-gradient-to-r min-h-screen from-rose-100 to-teal-100 grainy">
      <div className="max-w-5xl px-4 mx-auto pt-10">
        <Link href="/dashboard/notes">
          <Button className="bg-green-600" size="sm">
            Back
          </Button>
        </Link>
        <h1 className="text-3xl py-10 font-bold">
          Welcome to AI Request Viewer:
        </h1>
        <div className="flex flex-col gap-6">
          {record.map((record) => (
            <div
              key={record.id}
              className="bg-slate-200 w-full min-h-[50px] rounded-md p-4 text-neutral-800 font-medium"
            >
              <p>
                <span className="font-bold text-green-700">{record.name}</span>{" "}
                has requested{" "}
                <span className="text-indigo-700 font-bold">AI Companion.</span>
              </p>
              <p className="text-sm mt-2 antialiased max-w-prose">
                {record.AIrequest}
              </p>
              <p className="text-sm mt-3 text-neutral-600">
                {record.createdAt.toLocaleTimeString()}

                <span className="ml-2">
                  {record.createdAt.toLocaleDateString()}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
