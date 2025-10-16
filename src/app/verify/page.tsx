'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/header';
import { getFirestore, doc, getDoc, collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { Loader2, FileText, ShieldCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { initializeFirebase } from '@/firebase';

interface DecodedQrData {
    userId: string;
    documentIds: string[];
    timestamp: number;
}

interface DocumentWithId extends DocumentData {
    id: string;
}

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const [documents, setDocuments] = useState<DocumentWithId[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<{name: string, email: string} | null>(null);

    useEffect(() => {
        const data = searchParams.get('data');
        if (!data) {
            setError("No verification data found in URL.");
            setIsLoading(false);
            return;
        }

        const fetchDocuments = async () => {
            try {
                // Initialize Firebase to get Firestore instance
                const { firestore } = initializeFirebase();

                // Decode and parse QR data
                const decodedString = atob(data);
                const qrData: DecodedQrData = JSON.parse(decodedString);

                // Basic validation
                if (!qrData.userId || !qrData.documentIds || qrData.documentIds.length === 0) {
                    throw new Error("Invalid or incomplete QR code data.");
                }

                // Fetch user info
                const userDocRef = doc(firestore, 'users', qrData.userId);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserInfo({ name: userDocSnap.data().name, email: userDocSnap.data().email });
                } else {
                    throw new Error("User not found.");
                }
                
                // Fetch documents
                const docs: DocumentWithId[] = [];
                for (const docId of qrData.documentIds) {
                    const docRef = doc(firestore, 'users', qrData.userId, 'documents', docId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        docs.push({ id: docSnap.id, ...docSnap.data() });
                    }
                }

                if (docs.length === 0) {
                   throw new Error("No valid documents could be found for this QR code.");
                }

                setDocuments(docs);

            } catch (e: any) {
                console.error("Verification failed:", e);
                setError(e.message || "An unexpected error occurred during verification.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocuments();
    }, [searchParams]);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
                <Card className="w-full max-w-2xl glowing-border">
                    <CardHeader className="text-center">
                        <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
                        <CardTitle className="mt-4">Document Verification</CardTitle>
                        <CardDescription>
                            {isLoading ? "Verifying shared documents..." : (error ? "Verification Failed" : "Documents shared by " + (userInfo?.name || 'user'))}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-500 bg-destructive/10 p-4 rounded-md">
                                <p className="font-semibold">Error</p>
                                <p>{error}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                                        <div className="flex items-center gap-4">
                                            <FileText className="h-6 w-6 text-primary" />
                                            <div>
                                                <p className="font-medium">{doc.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Uploaded: {new Date(doc.uploadDate.seconds * 1000).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                          <Button variant="outline" size="sm">
                                              <Download className="mr-2 h-4 w-4" />
                                              View
                                          </Button>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}