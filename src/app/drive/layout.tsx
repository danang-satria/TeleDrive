import ClientLayout from "@/components/ClientLayout";

export default function DriveLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen w-screen transition-colors duration-200 overflow-hidden relative z-0">
      {/* Background Effects matching Landing Page */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-500/20 via-purple-500/10 to-transparent blur-3xl -z-10 rounded-full opacity-50 transform -translate-y-1/2"></div>
      
      <ClientLayout>{children}</ClientLayout>
    </div>
  );
}
