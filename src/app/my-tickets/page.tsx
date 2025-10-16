'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Ticket, Users, Hash, UserCircle } from 'lucide-react';
import { collection, query, where, collectionGroup } from 'firebase/firestore';

export default function MyTicketsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userQueueEntriesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // Use a collection group query to find all of the user's tickets
    // across all queues.
    return query(
      collectionGroup(firestore, 'queueEntries'),
      where('userId', '==', user.uid),
      where('status', '==', 'waiting')
    );
  }, [firestore, user]);

  const { data: queueEntries, isLoading: isLoadingEntries } = useCollection(userQueueEntriesQuery);
  
  const allQueuesQuery = useMemoFirebase(() => {
    if(!firestore) return null;
    return query(collection(firestore, 'queues'));
  }, [firestore]);

  const { data: allQueues, isLoading: isLoadingQueues } = useCollection(allQueuesQuery);
  
  const enrichedEntries = useMemoFirebase(() => {
    if (!queueEntries || !allQueues) return [];
    return queueEntries.map(entry => {
      const queueDetails = allQueues.find(q => q.id === entry.queueId);
      return {
        ...entry,
        queueName: queueDetails?.name || 'Loading...',
        currentNumber: queueDetails?.currentNumber || 0,
      };
    }).filter(entry => entry.queueName !== 'Loading...');
  }, [queueEntries, allQueues]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  const isLoading = isLoadingEntries || isLoadingQueues;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Active Tickets</h1>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && enrichedEntries && enrichedEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrichedEntries.map((entry) => {
                const peopleAhead = Math.max(0, entry.ticketNumber - entry.currentNumber - 1);
                return (
                    <Card key={entry.id} className="glowing-border flex flex-col">
                        <CardHeader>
                            <CardTitle>{entry.queueName}</CardTitle>
                            <CardDescription>Your ticket for this queue.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <div className="flex items-center justify-between text-lg">
                                <span className="flex items-center text-muted-foreground"><Ticket className="mr-2 h-5 w-5" /> Your Number</span>
                                <span className="font-bold text-2xl text-primary">#{entry.ticketNumber}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center text-muted-foreground"><Hash className="mr-2 h-4 w-4" /> Now Serving</span>
                                <span className="font-bold">#{entry.currentNumber}</span>
                            </div>
                             <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center text-muted-foreground"><Users className="mr-2 h-4 w-4" /> People Ahead</span>
                                <span className="font-bold">{peopleAhead}</span>
                            </div>
                            <div className="flex items-center justify-center text-sm p-3 mt-4 rounded-lg bg-primary/10 text-primary-foreground">
                                <UserCircle className="mr-2 h-5 w-5 text-primary" />
                                <span className="font-bold">You are here!</span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
          </div>
        ) : (
          !isLoading && (
            <div className="text-center py-16">
              <Ticket className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-6 text-xl font-semibold">You have no active tickets.</h3>
              <p className="mt-2 text-md text-muted-foreground">Join a queue from the 'Queues' page to get started.</p>
            </div>
          )
        )}
      </main>
    </div>
  );
}
