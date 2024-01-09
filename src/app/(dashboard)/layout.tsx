import { auth } from "@clerk/nextjs";
import Navbar from "./_components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  return (
    <div className="grainy min-h-screen">
      <div className="max-w-7xl mx-auto p-10">
        {/* display all the notes */}
        {userId == "user_2aham3WVFCXnibMRJS4p79uOep0" ? (
          <Link href="/admin">
            <Button className="bg-green-500 hover:bg-green-700">Admin</Button>
          </Link>
        ) : (
          ""
        )}
        <Navbar />
        {children}
      </div>
    </div>
  );
}
