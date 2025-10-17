
'use client';

import { useUser, useAuth } from '@/firebase';
import { QrCode, LogOut, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = "admin@flowidq.com";

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push('/');
  };

  return (
    <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <Link href="/" className="flex items-center space-x-2">
        <QrCode className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">FlowIDQ</span>
      </Link>
      <nav className="flex items-center space-x-1 md:space-x-4">
        {!isUserLoading &&
          (user ? (
            <>
              <Link href="/qr-hub">
                <Button variant="ghost">QR Hub</Button>
              </Link>
              <Link href="/documents">
                <Button variant="ghost">Documents</Button>
              </Link>
               <Link href="/queues">
                <Button variant="ghost">Queues</Button>
              </Link>
              <Link href="/records">
                <Button variant="ghost">Records</Button>
              </Link>
              {user.email === ADMIN_EMAIL && (
                 <Link href="/admin">
                    <Button variant="ghost" className="text-primary hover:text-primary/90">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin
                    </Button>
                </Link>
              )}
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          ))}
      </nav>
    </header>
  );
}
