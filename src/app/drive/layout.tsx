import ClientLayout from "@/components/ClientLayout";

export default function DriveLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-200 overflow-hidden">
      <ClientLayout>{children}</ClientLayout>
    </div>
  );
}
