'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

const AUTH_PAGES = ['/login', '/signup'];
const PUBLIC_PAGES = ['/'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading, userError } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) return;

    const isAuthPage = AUTH_PAGES.includes(pathname);
    const isPublicPage = PUBLIC_PAGES.includes(pathname);
    
    if (userError) {
      console.error("Firebase Auth Error:", userError);
      // Optional: redirect to an error page or show a toast
    }

    // If user is logged in
    if (user) {
      // If on an auth page (login/signup) or landing page, redirect to dashboard
      if (isAuthPage || isPublicPage) {
        router.push('/dashboard');
      }
    } 
    // If user is not logged in
    else {
      // If on a protected page (not public and not an auth page), redirect to login
      if (!isPublicPage && !isAuthPage) {
        router.push('/login');
      }
    }

  }, [user, isUserLoading, pathname, router, userError]);

  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isPublicPage = PUBLIC_PAGES.includes(pathname);

  // Show a loader while determining auth state, unless on a public page
  if (isUserLoading && !isPublicPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // While loading, if a user is found and they are on an auth or landing page, show loader during redirect
  if (isUserLoading && user && (isAuthPage || isPublicPage)) {
     return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no user is found and they are trying to access a protected page, show loader during redirect
  if (!isUserLoading && !user && !isPublicPage && !isAuthPage) {
      return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
