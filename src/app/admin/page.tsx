'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRight, User, ListOrdered } from 'lucide-react';
import { collection, query, orderBy, doc, runTransaction, where } from 'firebase/firestore';
import toast from 'react-hot-toast';

// Simple email-based access control for the admin page
const ADMIN_EMAIL = "admin@flowidq.com";

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);

  const queuesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'queues'), orderBy('name'));
  }, [firestore]);
  const { data: queues, isLoading: isLoadingQueues } = useCollection(queuesQuery);
  
  const selectedQueueEntriesQuery = useMemoFirebase(() => {
    if(!firestore || !selectedQueueId) return null;
    return query(
      collection(firestore, 'queueEntries'), 
      where('queueId', '==', selectedQueueId),
      where('status', '==', 'waiting'),
      orderBy('ticketNumber')
    );
  }, [firestore, selectedQueueId]);
  const { data: queueEntries, isLoading: isLoadingEntries } = useCollection(selectedQueueEntriesQuery);

  const selectedQueue = useMemoFirebase(() => {
    if (!queues || !selectedQueueId) return null;
    return queues.find(q => q.id === selectedQueueId);
  }, [queues, selectedQueueId]);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.email !== ADMIN_EMAIL) {
        toast.error("You don't have permission to access this page.");
        router.push('/qr-hub');
      }
    }
  }, [user, isUserLoading, router]);
  
  const handleCallNext = async () => {
    if (!firestore || !selectedQueueId || !selectedQueue) {
      toast.error("No queue selected.");
      return;
    }
    
    // Find the next person in line
    const currentNumber = selectedQueue.currentNumber || 0;
    const nextEntry = queueEntries?.find(entry => entry.ticketNumber > currentNumber);
    
    if (!nextEntry) {
      toast.error("No one else is in the queue.");
      return;
    }

    const queueRef = doc(firestore, 'queues', selectedQueueId);
    
    try {
       await runTransaction(firestore, async (transaction) => {
        const queueDoc = await transaction.get(queueRef);
        if (!queueDoc.exists()) {
          throw new Error("Queue does not exist!");
        }

        // Update the queue's current number to the next person's ticket
        transaction.update(queueRef, {
          currentNumber: nextEntry.ticketNumber
        });
      });
      
      toast.success(`Called ticket #${nextEntry.ticketNumber}.`);

    } catch (error) {
      console.error("Error calling next person:", error);
      toast.error("Failed to call next person.");
    }
  };


  if (isUserLoading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Queue Selection */}
            <div className="md:col-span-1">
                <Card className="glowing-border">
                    <CardHeader>
                        <CardTitle>Select a Queue</CardTitle>
                        <CardDescription>Choose a queue to manage.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                         {isLoadingQueues && <Loader2 className="animate-spin" />}
                         {!isLoadingQueues && queues?.map(q => (
                             <Button 
                                key={q.id}
                                variant={selectedQueueId === q.id ? 'default' : 'outline'}
                                className="w-full justify-start"
                                onClick={() => setSelectedQueueId(q.id)}
                            >
                                {q.name}
                             </Button>
                         ))}
                    </CardContent>
                </Card>
            </div>

            {/* Column 2: Queue Management */}
            <div className="md:col-span-2">
                <Card className="glowing-border">
                    <CardHeader>
                        <CardTitle>Queue Details</CardTitle>
                        {selectedQueue ? (
                            <CardDescription>Managing "{selectedQueue.name}"</CardDescription>
                        ) : (
                            <CardDescription>Select a queue to see details</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        {!selectedQueueId && <p className="text-muted-foreground">Please select a queue from the left.</p>}
                        {isLoadingQueues && selectedQueueId && <Loader2 className="animate-spin"/>}
                        
                        {selectedQueue && (
                             <>
                               <div className="flex justify-between items-center mb-6 p-4 rounded-lg bg-secondary">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Now Serving</p>
                                        <p className="text-3xl font-bold text-primary">#{selectedQueue.currentNumber || 0}</p>
                                    </div>
                                    <Button onClick={handleCallNext} disabled={isLoadingEntries}>
                                        Call Next <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                               </div>

                               <h3 className="text-lg font-semibold mb-4 flex items-center"><ListOrdered className="mr-2 h-5 w-5" />Waiting List</h3>
                               <div className="space-y-3">
                                   {isLoadingEntries && <div className="flex justify-center"><Loader2 className="animate-spin"/></div>}
                                   {!isLoadingEntries && queueEntries && queueEntries.length > 0 ? (
                                       queueEntries.map(entry => (
                                           <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-lg text-primary">#{entry.ticketNumber}</span>
                                                    <div className="flex items-center gap-2">
                                                      <User className="h-4 w-4 text-muted-foreground" />
                                                      <span className="font-medium">{entry.userName}</span>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-muted-foreground">Joined: {new Date(entry.entryTime.seconds * 1000).toLocaleTimeString()}</span>
                                           </div>
                                       ))
                                   ) : (
                                       !isLoadingEntries && <p className="text-muted-foreground text-center py-4">The waiting list is empty.</p>
                                   )}
                               </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}