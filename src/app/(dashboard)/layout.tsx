import Navbar from "./_components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grainy min-h-screen">
      <div className="max-w-7xl mx-auto p-10">
        {/* display all the notes */}
        <Navbar />

        {children}
      </div>
    </div>
  );
}
