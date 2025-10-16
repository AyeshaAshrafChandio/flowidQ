
import { AuthForm } from '@/components/auth-form';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
       <div className="absolute top-4 left-4">
        <Logo />
      </div>
      <div className="w-full max-w-sm">
        <AuthForm isSignUp={false} />
      </div>
    </div>
  );
}
