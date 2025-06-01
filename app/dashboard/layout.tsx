import { ConditionalNavbar } from '@/components/layout/conditional-navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <ConditionalNavbar />
      <div className="pt-16 p-4 sm:p-8">{children}</div>
    </div>
  );
}
