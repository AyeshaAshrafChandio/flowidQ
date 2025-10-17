
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, History, QrCode, FileClock, Globe } from 'lucide-react';
import { collection, query, where, collectionGroup, orderBy } from 'firebase/firestore';

export default function RecordsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  // 1. Get all queue entries for the current user
  const userQueueEntriesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collectionGroup(firestore, 'queueEntries'),
      where('userId', '==', user.uid),
      orderBy('entryTime', 'desc')
    );
  }, [firestore, user]);
  const { data: queueEntries, isLoading: isLoadingEntries } = useCollection(userQueueEntriesQuery);
  
  // 2. Get all queues to enrich the data
  const allQueuesQuery = useMemoFirebase(() => {
    if(!firestore) return null;
    return query(collection(firestore, 'queues'));
  }, [firestore]);
  const { data: allQueues, isLoading: isLoadingQueues } = useCollection(allQueuesQuery);

  // 3. Get document access logs for the current user
  const accessLogsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, `users/${user.uid}/accessLogs`), 
        orderBy('accessTime', 'desc')
    );
  }, [firestore, user]);
  const { data: accessLogs, isLoading: isLoadingAccessLogs } = useCollection(accessLogsQuery);
  
  // 4. Enrich the user's queue entries with details from the allQueues query
  const enrichedEntries = useMemo(() => {
    if (!queueEntries || !allQueues) return [];
    
    const queuesMap = new Map(allQueues.map(q => [q.id, q]));

    return queueEntries.map(entry => {
      const queueDetails = queuesMap.get(entry.queueId);
      return {
        ...entry,
        queueName: queueDetails?.name || 'Unknown Queue',
        locationName: queueDetails?.locationName || '',
      };
    });
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

  const isLoading = isLoadingEntries || isLoadingQueues || isLoadingAccessLogs;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">My Records</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Queue History */}
            <Card className="glowing-border">
                <CardHeader>
                    <CardTitle className="flex items-center"><History className="mr-2 h-6 w-6"/>Queue History</CardTitle>
                    <CardDescription>A record of all queues you have joined.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingEntries || isLoadingQueues ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : enrichedEntries && enrichedEntries.length > 0 ? (
                        <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-2">
                           {enrichedEntries.map(entry => (
                             <div key={entry.id} className="p-4 rounded-lg bg-secondary/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{entry.queueName}</p>
                                        <p className="text-sm text-muted-foreground">{entry.locationName}</p>
                                    </div>
                                    <span className={`capitalize text-xs font-semibold px-2 py-1 rounded-full ${
                                        entry.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-400' :
                                        entry.status === 'serving' ? 'bg-blue-500/20 text-blue-400' :
                                        entry.status === 'served' ? 'bg-green-500/20 text-green-400' :
                                        entry.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                        'bg-gray-500/20 text-gray-400'
                                    }`}>
                                        {entry.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <p className="text-sm text-muted-foreground">Your Ticket: <span className="font-bold text-primary">#{entry.ticketNumber}</span></p>
                                    <p className="text-xs text-muted-foreground">
                                        {entry.entryTime ? new Date(entry.entryTime.seconds * 1000).toLocaleString() : 'Just now'}
                                    </p>
                                </div>
                             </div>
                           ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <History className="mx-auto h-12 w-12" />
                            <h3 className="mt-4 text-lg font-semibold">No Queue History</h3>
                            <p className="mt-2 text-sm">You have not joined any queues yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {/* Shared QR History */}
            <Card className="glowing-border">
                <CardHeader>
                    <CardTitle className="flex items-center"><QrCode className="mr-2 h-6 w-6"/>Document Access History</CardTitle>
                    <CardDescription>A record of all QR codes you have generated to share documents.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingAccessLogs ? (
                         <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : accessLogs && accessLogs.length > 0 ? (
                        <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-2">
                           {accessLogs.map(log => (
                             <div key={log.id} className="p-4 rounded-lg bg-secondary/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{log.documentIds.length} Document{log.documentIds.length > 1 ? 's' : ''} Accessed</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2"><Globe className="h-3 w-3" /> {log.ipAddress || 'Unknown IP'}</p>
                                    </div>
                                    <span className="capitalize text-xs font-semibold px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                                        {log.accessType}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                                       <FileClock className="h-3 w-3"/> {log.accessTime ? new Date(log.accessTime.seconds * 1000).toLocaleString() : 'Just now'}
                                    </p>
                                </div>
                             </div>
                           ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <QrCode className="mx-auto h-12 w-12" />
                            <h3 className="mt-4 text-lg font-semibold">No Shared History</h3>
                            <p className="mt-2 text-sm">No one has accessed your shared documents yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}

    