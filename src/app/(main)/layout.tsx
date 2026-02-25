import { AppBar } from '@/components/layout/AppBar';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-surface-page min-h-screen">
      <AppBar />
      <main>{children}</main>
    </div>
  );
}
