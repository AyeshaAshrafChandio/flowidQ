
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, Clock, ShieldAlert, History } from 'lucide-react';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { WithId } from '@/firebase/firestore/use-collection';

type AccessLog = {
  documentIds: string[];
  accessTime: { seconds: number; nanoseconds: number };
  accessType: string;
  ipAddress: string;
  documentNames?: string[];
};

export default function RecordsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const accessLogsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'accessLogs'), orderBy('accessTime', 'desc'));
  }, [firestore, user]);

  const { data: accessLogs, isLoading: isLoadingLogs, error } = useCollection<AccessLog>(accessLogsQuery);
  
  const enrichedLogs = useMemo(() => {
    if (!accessLogs || !firestore || !user) return accessLogs;

    const fetchDocNames = async (log: WithId<AccessLog>) => {
      try {
        const names = await Promise.all(
          log.documentIds.map(async (docId) => {
            const docRef = doc(firestore, 'users', user.uid, 'documents', docId);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data().name : 'Deleted Document';
          })
        );
        return { ...log, documentNames: names };
      } catch (e) {
        return { ...log, documentNames: ['Error fetching names'] };
      }
    };

    return Promise.all(accessLogs.map(fetchDocNames));
  }, [accessLogs, firestore, user]);

  const [resolvedLogs, setResolvedLogs] = useState<WithId<AccessLog>[] | null>(null);

  useEffect(() => {
    if (enrichedLogs instanceof Promise) {
      enrichedLogs.then(setResolvedLogs);
    } else {
      setResolvedLogs(enrichedLogs);
    }
  }, [enrichedLogs]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);


  if (isUserLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Access Records</h1>

        <Card className="glowing-border">
          <CardHeader>
            <CardTitle>Document Access History</CardTitle>
            <CardDescription>
              A log of all access events for your shared documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingLogs && (
                <div className="text-center py-12">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Loading Access Logs...</h3>
                </div>
              )}

              {!isLoadingLogs && resolvedLogs && resolvedLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-start gap-4">
                    <History className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-semibold">
                         {log.documentNames ? log.documentNames.join(', ') : 'Loading document names...'}
                      </p>
                      <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                        <span className="flex items-center">
                            <Clock className="mr-1.5 h-4 w-4" />
                            {new Date(log.accessTime.seconds * 1000).toLocaleString()}
                        </span>
                        <span className="flex items-center">
                            <ShieldAlert className="mr-1.5 h-4 w-4" />
                            IP: {log.ipAddress}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {log.accessType}
                  </div>
                </div>
              ))}

              {!isLoadingLogs && (!resolvedLogs || resolvedLogs.length === 0) && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Access Records Found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your shared documents have not been accessed yet.
                  </p>
                </div>
              )}
               {error && (
                <div className="text-center text-red-500 bg-destructive/10 p-4 rounded-md">
                    <p className="font-semibold">Error</p>
                    <p>Could not load access logs. Please check your Firestore security rules.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
