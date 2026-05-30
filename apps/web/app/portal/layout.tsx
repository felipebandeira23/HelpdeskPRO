'use client';
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-900 flex flex-col">
      <div className="bg-blue-600 h-2 w-full"></div>
      <main className="flex-1 container mx-auto p-4 md:p-8 max-w-5xl">
        {children}
      </main>
    </div>
  );
}
