
import Header from '@/components/header';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import VerifyComponent from './verify-component';

export default function VerifyPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
                <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
                    <VerifyComponent />
                </Suspense>
            </main>
        </div>
    );
}
