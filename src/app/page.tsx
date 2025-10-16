import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ShieldCheck,
  UploadCloud,
  QrCode,
  Users,
  Smartphone,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/logo';

const features = [
  {
    icon: <UploadCloud className="h-8 w-8 text-primary" />,
    title: 'Digital Document Wallet',
    description: 'Securely upload, encrypt, and manage all your important documents in one place.',
  },
  {
    icon: <QrCode className="h-8 w-8 text-primary" />,
    title: 'Instant Queue Entry',
    description: 'Scan a QR code at any supported location to instantly join the queue.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Real-Time Tracking',
    description: 'See your position, estimated wait time, and the number of people ahead of you.',
  },
  {
    icon: <Smartphone className="h-8 w-8 text-primary" />,
    title: 'Push Notifications',
    description: 'Receive timely alerts on your phone when your turn is approaching.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: 'Privacy First',
    description: 'Your data is encrypted and only minimal information is shared to join a queue.',
  },
];

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Logo />
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="shadow-lg shadow-primary/30">
            <Link href="/signup">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 text-center md:px-6 md:py-24 lg:py-32">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-br from-primary via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Ditch the Wait. Secure Your Life.
          </h1>
          <p className="mx-auto mt-4 max-w-[700px] text-lg text-foreground/80 md:text-xl">
            FlowIDQ combines a secure digital wallet for your documents with a smart, real-time queueing system.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild className="shadow-lg shadow-primary/30">
              <Link href="/signup">
                Join the Flow <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-5xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                A Seamless Experience for Modern Life
              </h2>
              <p className="mt-4 text-foreground/80 md:text-lg">
                FlowIDQ integrates powerful features to safeguard your digital identity and streamline your daily errands.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="flex flex-col items-center p-6 text-center bg-card/80 backdrop-blur-sm border-primary/10 shadow-lg shadow-primary/5 hover:border-primary/30 transition-all duration-300">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    {feature.icon}
                  </div>
                  <CardHeader className="p-0">
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardDescription className="mt-2 text-base">
                    {feature.description}
                  </CardDescription>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {heroImage && (
          <section className="container mx-auto px-4 py-16 md:px-6 md:py-24 lg:py-32">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="font-headline text-3xl font-bold text-white">
                  Powered by Firebase and GenAI
                </h3>
                <p className="mt-2 max-w-lg text-lg text-white/90">
                  Leveraging state-of-the-art technology to provide a seamless and secure experience you can trust.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 text-center md:flex-row md:px-6">
          <Logo />
          <p className="text-sm text-foreground/60">
            &copy; {new Date().getFullYear()} FlowIDQ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
