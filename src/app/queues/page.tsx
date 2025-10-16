
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, Hash, Loader2, UserCheck, Ticket } from 'lucide-react';
import { collection, query, orderBy, addDoc, serverTimestamp, doc, runTransaction, where, getDocs, collectionGroup } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


export default function QueuesPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const [queues, setQueues] = useState<any[]>([]);
  const [isLoadingQueues, setIsLoadingQueues] = useState(true);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [userJoinedQueueIds, setUserJoinedQueueIds] = useState<string[]>([]);

  useEffect(() => {
    if (!firestore || !user?.uid) {
        if (!isUserLoading) {
            setIsLoadingQueues(false);
        }
        return;
    };

    setIsLoadingQueues(true);
    
    const fetchData = async () => {
        try {
            // 1. Fetch all available queues
            const queuesQuery = query(collection(firestore, 'queues'), orderBy('name'));
            const queuesSnapshot = await getDocs(queuesQuery);
            const queuesData = queuesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setQueues(queuesData);

            // 2. Check which queues the user has already joined
            const joinedQueuesQuery = query(
              collectionGroup(firestore, 'queueEntries'), 
              where('userId', '==', user.uid),
              where('status', '==', 'waiting')
            );
            const joinedSnapshot = await getDocs(joinedQueuesQuery);
            const joinedIds = joinedSnapshot.docs.map(doc => doc.data().queueId);
            setUserJoinedQueueIds(joinedIds);
        } catch (error) {
            console.error("Error fetching queues data:", error);
            toast.error("Could not load queue information.");
        } finally {
            setIsLoadingQueues(false);
        }
    };

    fetchData();
  }, [firestore, user?.uid, isUserLoading]);


  const handleJoinQueue = async (queue: any) => {
    if (!user || !firestore) {
      toast.error('You must be logged in to join a queue.');
      return;
    }

    setIsJoining(queue.id);

    try {
      if (userJoinedQueueIds.includes(queue.id)) {
        toast.error("You are already in this queue.");
        setIsJoining(null);
        return;
      }

      const queueRef = doc(firestore, 'queues', queue.id);
      
      let newTicketNumber = 0;

      await runTransaction(firestore, async (transaction) => {
        const queueDoc = await transaction.get(queueRef);
        if (!queueDoc.exists()) {
          throw new Error("Queue does not exist!");
        }

        const queueData = queueDoc.data();
        newTicketNumber = (queueData.lastTicketNumber || 0) + 1;
        
        transaction.update(queueRef, {
          lastTicketNumber: newTicketNumber,
          totalInQueue: (queueData.totalInQueue || 0) + 1,
        });

        const newEntryRef = doc(collection(firestore, 'queues', queue.id, 'queueEntries'));
        transaction.set(newEntryRef, {
            userId: user.uid,
            ticketNumber: newTicketNumber,
            entryTime: serverTimestamp(),
            status: 'waiting',
            userName: user.displayName || 'Anonymous',
            queueId: queue.id,
        });

      });
      
      toast.success(`Successfully joined "${queue.name}" with ticket #${newTicketNumber}!`);
      setUserJoinedQueueIds(prev => [...prev, queue.id]);

    } catch (error: any) {
      console.error("Error joining queue:", error);
      toast.error(error.message || 'Failed to join queue.');
    } finally {
      setIsJoining(null);
    }
  };


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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Smart Queues</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoadingQueues && (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoadingQueues && queues && queues.length > 0 ? (
            queues.map((queue) => {
              const isUserInQueue = userJoinedQueueIds.includes(queue.id);
              return (
                <Card key={queue.id} className="glowing-border flex flex-col">
                  <CardHeader>
                    <CardTitle>{queue.name}</CardTitle>
                    <CardDescription>{queue.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-muted-foreground"><Users className="mr-2 h-4 w-4" /> People in queue</span>
                      <span className="font-bold">{queue.totalInQueue || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-muted-foreground"><Clock className="mr-2 h-4 w-4" /> Avg. Wait</span>
                      <span className="font-bold">~{queue.averageWaitTime} min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-muted-foreground"><Hash className="mr-2 h-4 w-4" /> Now Serving</span>
                      <span className="font-bold text-lg text-primary">#{queue.currentNumber || 'N/A'}</span>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0">
                    {isUserInQueue ? (
                       <Button className="w-full" disabled>
                        <UserCheck className="mr-2 h-4 w-4" />
                        You are in this queue
                      </Button>
                    ) : (
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button className="w-full" disabled={isJoining === queue.id}>
                                {isJoining === queue.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Ticket className="mr-2 h-4 w-4" />
                                )}
                                Join Queue
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm to join queue</AlertDialogTitle>
                              <AlertDialogDescription>
                                You are about to join the "{queue.name}" queue. By joining, your name will be visible to the queue administrators. Do you wish to proceed?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleJoinQueue(queue)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            !isLoadingQueues && (
              <div className="col-span-full text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Queues Available</h3>
                <p className="mt-2 text-sm text-muted-foreground">Please check back later or contact an administrator.</p>
              </div>
            )
          )}
        </div>

      </main>
    </div>
  );
}
