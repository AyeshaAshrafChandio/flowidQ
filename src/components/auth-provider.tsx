'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { useUser } from '@/firebase';
import { Logo } from './logo';

const publicRoutes = ['/', '/login', '/signup'];
const protectedRoutes = ['/dashboard']; // Add other protected routes here

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user auth state is loaded
    }

    const isPublicRoute = publicRoutes.includes(pathname);
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (!user && isProtectedRoute) {
      // If user is not logged in and tries to access a protected route, redirect to login
      router.push('/login');
    } else if (user && (pathname === '/login' || pathname === '/signup')) {
      // If user is logged in and tries to access login/signup, redirect to dashboard
      router.push('/dashboard');
    }
  }, [user, isUserLoading, pathname, router]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <Logo />
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
