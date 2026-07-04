import ProtectedRoute from "@/components/routes/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-5xl flex-1 p-4">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
