
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Ticket, Users, Hash, AlertTriangle } from 'lucide-react';
import { collection, query, where, collectionGroup } from 'firebase/firestore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MyTicketsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  // Get all active queue entries for the current user across all queues
  const userQueueEntriesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collectionGroup(firestore, 'queueEntries'),
      where('userId', '==', user.uid),
      where('status', '==', 'waiting')
    );
  }, [firestore, user]);
  const { data: queueEntries, isLoading: isLoadingEntries, error: entriesError } = useCollection(userQueueEntriesQuery);
  
  // Get all queues to enrich the ticket data
  const allQueuesQuery = useMemoFirebase(() => {
    if(!firestore) return null;
    return query(collection(firestore, 'queues'));
  }, [firestore]);
  const { data: allQueues, isLoading: isLoadingQueues, error: queuesError } = useCollection(allQueuesQuery);
  
  // Combine the user's tickets with the details of the queue they belong to
  const enrichedEntries = useMemo(() => {
    if (!queueEntries || !allQueues) return [];
    
    const queuesMap = new Map(allQueues.map(q => [q.id, q]));

    return queueEntries.map(entry => {
      const queueDetails = queuesMap.get(entry.queueId);
      return {
        ...entry,
        queueName: queueDetails?.name || 'Loading...',
        currentNumber: queueDetails?.currentNumber || 0,
        locationName: queueDetails?.locationName || 'Unknown Location'
      };
    }).filter(entry => entry.queueName !== 'Loading...'); // Filter out entries where queue details haven't loaded yet
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
  const dataFetchError = entriesError || queuesError;

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

        {!isLoading && dataFetchError && (
          <Alert variant="destructive" className="glowing-border">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Tickets</AlertTitle>
            <AlertDescription>
              There was a problem loading your ticket information. Please try again later or contact the owner for assistance.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !dataFetchError && enrichedEntries && enrichedEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrichedEntries.map((entry) => {
                const peopleAhead = Math.max(0, entry.ticketNumber - (entry.currentNumber || 0) - 1);
                return (
                    <Card key={entry.id} className="glowing-border flex flex-col">
                        <CardHeader>
                            <CardTitle>{entry.queueName}</CardTitle>
                            <CardDescription>{entry.locationName}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col justify-between space-y-4">
                            <div className="text-center">
                                <p className="text-lg text-muted-foreground">Your Number</p>
                                <p className="text-7xl font-bold text-primary">#{entry.ticketNumber}</p>
                            </div>
                            <div className='space-y-2'>
                                <div className="flex items-center justify-between text-lg">
                                    <span className="flex items-center text-muted-foreground"><Hash className="mr-2 h-5 w-5" /> Now Serving</span>
                                    <span className="font-bold">#{entry.currentNumber || 0}</span>
                                </div>
                                <div className="flex items-center justify-between text-lg">
                                    <span className="flex items-center text-muted-foreground"><Users className="mr-2 h-5 w-5" /> People Ahead</span>
                                    <span className="font-bold">{peopleAhead}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
          </div>
        ) : (
          !isLoading && !dataFetchError && (
            <div className="text-center py-16 border-2 border-dashed border-secondary rounded-lg">
              <Ticket className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-6 text-xl font-semibold">You have no active tickets.</h3>
              <p className="mt-2 text-md text-muted-foreground">Join a queue from the 'Queues' page to get your ticket.</p>
                <Link href="/queues" passHref>
                    <Button className="mt-6">View Queues</Button>
                </Link>
            </div>
          )
        )}
      </main>
    </div>
  );
}
