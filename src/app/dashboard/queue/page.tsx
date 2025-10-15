'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Clock, Building, CheckCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


const queueLocations = [
  {
    id: 'hospital',
    name: 'City General Hospital',
    icon: <Building className="h-8 w-8 text-primary" />,
    peopleWaiting: 12,
    estimatedWait: 45,
  },
  {
    id: 'bank',
    name: 'Downtown Central Bank',
    icon: <Building className="h-8 w-8 text-primary" />,
    peopleWaiting: 5,
    estimatedWait: 15,
  },
  {
    id: 'public-office',
    name: 'Public Services Office',
    icon: <Building className="h-8 w-8 text-primary" />,
    peopleWaiting: 25,
    estimatedWait: 90,
  },
];

type JoinedQueue = {
  locationName: string;
  ticketNumber: string;
  position: number;
} | null;

export default function QueuePage() {
  const [joinedQueue, setJoinedQueue] = useState<JoinedQueue>(null);
  const [confirmingQueue, setConfirmingQueue] = useState<typeof queueLocations[0] | null>(null);

  const handleJoinQueue = (location: typeof queueLocations[0]) => {
    const ticketNumber = `${location.id.substring(0,2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    setJoinedQueue({
        locationName: location.name,
        ticketNumber: ticketNumber,
        position: location.peopleWaiting + 1,
    });
    setConfirmingQueue(null);
  };

  const handleLeaveQueue = () => {
    setJoinedQueue(null);
  }

  return (
    <>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">Smart Queue System</h2>
            <p className="text-muted-foreground">
              Join queues remotely and save time.
            </p>
          </div>
        </div>

        {joinedQueue ? (
            <Card className="max-w-md mx-auto bg-primary/5 border-primary/20 shadow-lg">
                 <CardHeader className="text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <CardTitle className="font-headline text-2xl">You're in the Queue!</CardTitle>
                    <CardDescription>{joinedQueue.locationName}</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Your Ticket Number</p>
                        <p className="font-bold text-3xl font-code">{joinedQueue.ticketNumber}</p>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Your Position</p>
                        <p className="font-bold text-3xl">{joinedQueue.position}</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" onClick={handleLeaveQueue}>Leave Queue</Button>
                </CardFooter>
            </Card>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {queueLocations.map((location) => (
                <Card key={location.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-3">{location.icon}</div>
                      <CardTitle className="font-headline text-xl">{location.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="mr-2 h-5 w-5" />
                      <span>
                        <span className="font-bold text-foreground">{location.peopleWaiting}</span> people waiting
                      </span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-5 w-5" />
                      <span>
                        Estimated wait time:{' '}
                        <span className="font-bold text-foreground">{location.estimatedWait} min</span>
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => setConfirmingQueue(location)}>Join Queue</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
        )}
      </div>
      <AlertDialog open={!!confirmingQueue} onOpenChange={() => setConfirmingQueue(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm to Join Queue?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to join the queue for <span className="font-bold">{confirmingQueue?.name}</span>. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmingQueue && handleJoinQueue(confirmingQueue)}>
              Yes, Join Queue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
