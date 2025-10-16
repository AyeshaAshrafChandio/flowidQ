import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileCheck2, QrCode, Users } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: <FileCheck2 className="h-10 w-10 text-primary" />,
    title: "Secure Document Wallet",
    description: "Upload, encrypt, and manage your important documents with bank-level security. Share them instantly via secure QR codes.",
  },
  {
    icon: <QrCode className="h-10 w-10 text-primary" />,
    title: "Smart Queue System",
    description: "Scan a QR code to join a queue from anywhere. Get real-time updates and an accurate estimated waiting time, so you can arrive just in time.",
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "AI-Powered Verification",
    description: "Our intelligent agents automatically verify documents and manage queue flows, ensuring a seamless and efficient experience for everyone.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <QrCode className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">FlowIDQ</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <div className="relative inline-block">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10"></div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Your Time is Valuable.
            </h1>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary mt-2">
              Your Documents, Secure.
            </h1>
          </div>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Welcome to FlowIDQ, the future of identity management and customer flow. Securely store your documents and say goodbye to waiting in line.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="glowing-shadow">Get Started for Free</Button>
            </Link>
            <Link href="#">
              <Button size="lg" variant="outline">Learn More</Button>
            </Link>
          </div>
        </section>

        <section id="features" className="bg-secondary/50 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">A Smarter Way to Manage Your World</h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">FlowIDQ integrates your digital identity with physical spaces, creating a seamless experience.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-background/50 glowing-border text-center">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-6">{feature.icon}</div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} FlowIDQ. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
