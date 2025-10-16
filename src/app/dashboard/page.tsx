
import { Logo } from '@/components/logo';
import UserNav from '@/components/user-nav';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Logo />
        <UserNav />
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Welcome to your FlowIDQ dashboard.</p>
        </div>
      </main>
    </div>
  );
}
