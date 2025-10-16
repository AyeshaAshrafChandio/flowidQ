import { QrCode } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-xl font-bold font-headline", className)}>
      <div className="p-1.5 bg-primary/20 text-primary rounded-lg">
        <QrCode className="h-5 w-5" />
      </div>
      <span>FlowIDQ</span>
    </Link>
  );
}
