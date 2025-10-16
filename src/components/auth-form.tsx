'use client';

import * as React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const formSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

type FormData = z.infer<typeof formSchema>;

interface AuthFormProps {
  isSignUp: boolean;
}

export function AuthForm({ isSignUp }: AuthFormProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        if (!data.displayName) {
          form.setError('displayName', {
            type: 'manual',
            message: 'Display name is required for sign up.',
          });
          setIsSubmitting(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        const user = userCredential.user;
        const userRef = doc(firestore, 'users', user.uid);
        
        // Use non-blocking update
        setDocumentNonBlocking(userRef, {
          uid: user.uid,
          displayName: data.displayName,
          email: data.email,
          createdAt: serverTimestamp(),
        }, { merge: true });

        toast({
          title: 'Account Created',
          description: "You've successfully signed up!",
        });
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({
          title: 'Logged In',
          description: "You've successfully logged in!",
        });
      }
      // Redirect is handled by AuthProvider
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description:
          error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-2xl font-headline font-bold text-center">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h2>

          {isSignUp && (
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? 'Processing...'
              : isSignUp
              ? 'Sign Up'
              : 'Log In'}
          </Button>
        </form>
      </Form>
      <p className="mt-6 text-center text-sm text-foreground/80">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <Link
          href={isSignUp ? '/login' : '/signup'}
          className="font-semibold text-primary hover:underline"
        >
          {isSignUp ? 'Log In' : 'Sign Up'}
        </Link>
      </p>
    </div>
  );
}
