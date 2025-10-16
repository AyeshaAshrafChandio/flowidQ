'use client';

import AuthForm from '@/components/auth-form';
import Header from '@/components/header';

export default function SignUp() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <AuthForm mode="signup" />
        </div>
      </main>
    </div>
  );
}
