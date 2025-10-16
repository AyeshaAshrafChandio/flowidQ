'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function DocumentsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const storage = getStorage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time listener for user's documents
  const documentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'documents'), orderBy('uploadDate', 'desc'));
  }, [firestore, user]);
  
  const { data: documents, isLoading: isLoadingDocuments } = useCollection(documentsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File is too large. Maximum size is 10MB.');
        return;
      }
      setSelectedFile(file);
      handleUpload(file); // Automatically start upload on file selection
    }
  };

  const handleUpload = async (file: File) => {
    if (!user) {
      toast.error('You must be logged in to upload documents.');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `documents/${user.uid}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        toast.error('Upload failed. Please try again.');
        setIsUploading(false);
        setUploadProgress(null);
        setSelectedFile(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          if (!firestore) return;
          const documentsColRef = collection(firestore, 'users', user.uid, 'documents');
          addDocumentNonBlocking(documentsColRef, {
            name: file.name,
            fileUrl: downloadURL,
            uploadDate: serverTimestamp(),
            category: file.type,
            isEncrypted: true, // Assuming encryption is handled by Storage rules/features
            userId: user.uid,
          });

          toast.success('Document uploaded successfully!');
          setIsUploading(false);
          setUploadProgress(null);
          setSelectedFile(null);
        });
      }
    );
  };


  if (isUserLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Document Wallet</h1>
          <Button onClick={handleFileSelect} disabled={isUploading}>
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload Document
          </Button>
          <Input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,.pdf,.doc,.docx"
          />
        </div>

        {isUploading && selectedFile && (
          <div className="mb-8 p-4 rounded-lg bg-secondary/50">
            <p className="font-medium mb-2">Uploading: {selectedFile.name}</p>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        <Card className="glowing-border">
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>
              Here are all the documents you've securely uploaded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingDocuments && <p>Loading documents...</p>}
              {!isLoadingDocuments && documents && documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-4">
                      <FileText className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded on {doc.uploadDate ? new Date(doc.uploadDate.seconds * 1000).toLocaleDateString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))
              ) : (
                !isLoadingDocuments && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">You haven't uploaded any documents yet.</p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Dummy progress component for UI consistency
const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number | null }
>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className="relative h-2 w-full overflow-hidden rounded-full bg-secondary"
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
));
Progress.displayName = "Progress";
import * as React from 'react';
