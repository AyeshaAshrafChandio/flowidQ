
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Trash2, Loader2, QrCode, X, FileEdit, Save, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { collection, query, orderBy, serverTimestamp, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { analyzeDocument } from '@/ai/flows/document-analyzer-flow';

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

interface OptimisticUpload {
  id: string;
  fileName: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  file: File;
}

export default function DocumentsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [optimisticUploads, setOptimisticUploads] = useState<OptimisticUpload[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [editingDoc, setEditingDoc] = useState<{ id: string, name: string } | null>(null);
  const [qrDialogData, setQrDialogData] = useState<{ value: string; name: string } | null>(null);

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

  const fileToDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    if (!user || !firestore) {
      toast.error('You must be logged in to upload documents.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File is too large. Maximum size is 10MB.');
      return;
    }

    const optimisticId = `optimistic-${Date.now()}`;
    const newUpload: OptimisticUpload = {
      id: optimisticId,
      fileName: file.name,
      progress: 0,
      status: 'uploading',
      file: file,
    };

    // Optimistically add to UI
    setOptimisticUploads(prev => [newUpload, ...prev]);

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `documents/${user.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setOptimisticUploads(prev => prev.map(up => up.id === optimisticId ? { ...up, progress } : up));
        },
        (error) => {
          console.error("Upload failed:", error);
          setOptimisticUploads(prev => prev.map(up => up.id === optimisticId ? { ...up, status: 'error', error: 'Upload failed' } : up));
        },
        async () => {
          // Upload complete, now save to Firestore
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const docData = {
              name: file.name,
              fileUrl: downloadURL,
              storagePath: storageRef.fullPath,
              uploadDate: serverTimestamp(),
              category: file.type,
              userId: user.uid,
            };

            const docRef = await addDoc(collection(firestore, 'users', user.uid, 'documents'), docData);
            
            // Once saved to Firestore, useCollection will pick it up, so we can remove the optimistic one
            setOptimisticUploads(prev => prev.filter(up => up.id !== optimisticId));
            toast.success(`"${file.name}" uploaded successfully!`);

            // AI analysis in the background
            if (file.type.startsWith('image/')) {
              fileToDataURI(file).then(dataUri => {
                analyzeDocument({ photoDataUri: dataUri }).then(analysisResult => {
                  updateDoc(docRef, { aiAnalysis: analysisResult });
                  toast.success(`AI analysis complete for "${file.name}"`);
                }).catch(aiError => {
                  console.error("AI analysis failed:", aiError);
                  // Non-blocking error
                });
              });
            }
          } catch (dbError: any) {
            console.error("Firestore save failed:", dbError);
            setOptimisticUploads(prev => prev.map(up => up.id === optimisticId ? { ...up, status: 'error', error: 'Save to database failed' } : up));
          }
        }
      );
    } catch (error) {
        console.error("Upload initiation failed:", error);
        setOptimisticUploads(prev => prev.map(up => up.id === optimisticId ? { ...up, status: 'error', error: 'Could not start upload' } : up));
    } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  const handleDelete = async (docId: string, storagePath: string) => {
    if (!user || !firestore) return;
    
    const storage = getStorage();
    const docRef = doc(firestore, 'users', user.uid, 'documents', docId);
    const storageRef = ref(storage, storagePath);
    const toastId = toast.loading("Deleting document...");

    try {
      await deleteDoc(docRef);
      await deleteObject(storageRef);
      toast.success('Document deleted.', { id: toastId });
      setSelectedDocs(prev => prev.filter(id => id !== docId));
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document.', { id: toastId });
    }
  };
  
  const handleStartEdit = (doc: { id: string, name: string }) => {
    setEditingDoc({ id: doc.id, name: doc.name });
  };

  const handleCancelEdit = () => {
    setEditingDoc(null);
  };

  const handleUpdateName = async () => {
    if (!editingDoc || !user || !firestore || !editingDoc.name.trim()) {
      toast.error('Document name cannot be empty.');
      return;
    }
    
    const docRef = doc(firestore, 'users', user.uid, 'documents', editingDoc.id);
    const toastId = toast.loading("Renaming document...");
    
    try {
        await updateDoc(docRef, { name: editingDoc.name });
        toast.success('Document renamed.', { id: toastId });
        handleCancelEdit();
    } catch(error) {
        console.error('Error renaming document', error);
        toast.error('Failed to rename document.', { id: toastId });
    }
  };

  const generateQrValue = (docIds: string[]) => {
      if(!user) return '';
      const qrData = {
        userId: user.uid,
        documentIds: docIds,
        timestamp: Date.now(),
      };
      return `${window.location.origin}/verify?data=${btoa(JSON.stringify(qrData))}`;
  }
  
  const handleGenerateQrForSingle = (doc: {id: string, name: string}) => {
      const qrValue = generateQrValue([doc.id]);
      setQrDialogData({ value: qrValue, name: doc.name });
  };
  
  const handleGenerateQrForMultiple = () => {
    if (selectedDocs.length === 0) {
      toast.error('Please select at least one document.');
      return;
    }
    const qrValue = generateQrValue(selectedDocs);
    setQrDialogData({ value: qrValue, name: `${selectedDocs.length} Documents` });
  };

  if (isUserLoading) {
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
        <div className="flex justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Document Wallet</h1>
          <div className="flex gap-2">
             <Button onClick={handleGenerateQrForMultiple} disabled={selectedDocs.length === 0}>
                <QrCode className="mr-2 h-4 w-4" />
                Share Selected ({selectedDocs.length})
              </Button>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
          <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.doc,.docx" />
        </div>

        <Card className="glowing-border">
            <CardHeader>
                <CardTitle>Your Documents</CardTitle>
                <CardDescription>Select documents to share, or generate a QR code for a single file.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {isLoadingDocuments && <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                
                {optimisticUploads.map(upload => (
                  <div key={upload.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-4 flex-grow">
                      <FileText className="h-6 w-6 text-primary" />
                      <div className="flex-grow">
                          <p className="font-medium">{upload.fileName}</p>
                          {upload.status === 'uploading' && (
                             <div className="flex items-center gap-2 mt-1">
                                <div className="relative h-1 w-full overflow-hidden rounded-full bg-background">
                                  <div className="h-full w-full flex-1 bg-primary transition-all" style={{ transform: `translateX(-${100 - upload.progress}%)` }}/>
                                </div>
                                <p className="text-xs text-muted-foreground">{upload.progress.toFixed(0)}%</p>
                              </div>
                          )}
                           {upload.status === 'error' && (
                              <div className="flex items-center gap-2 mt-1 text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                <p className="text-xs font-medium">{upload.error}</p>
                              </div>
                           )}
                      </div>
                    </div>
                     <Button variant="ghost" size="icon" onClick={() => setOptimisticUploads(p => p.filter(up => up.id !== upload.id))}>
                        <X className="h-4 w-4 text-red-500" />
                     </Button>
                  </div>
                ))}
                
                {!isLoadingDocuments && documents && documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                        <div className="flex items-center gap-4 flex-grow">
                        <Checkbox id={`select-${doc.id}`} checked={selectedDocs.includes(doc.id)} onCheckedChange={() => setSelectedDocs(p => p.includes(doc.id) ? p.filter(id => id !== doc.id) : [...p, doc.id])} disabled={!!editingDoc} />
                        <FileText className="h-6 w-6 text-primary" />
                        {editingDoc?.id === doc.id ? (
                            <Input value={editingDoc.name} onChange={(e) => setEditingDoc({...editingDoc, name: e.target.value})} className="h-8" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()} />
                        ) : (
                            <div>
                              <label htmlFor={`select-${doc.id}`} className="font-medium cursor-pointer">{doc.name}</label>
                              <p className="text-sm text-muted-foreground">Uploaded on {doc.uploadDate ? new Date(doc.uploadDate.seconds * 1000).toLocaleDateString() : 'Just now'}</p>
                            </div>
                        )}
                        </div>
                        <div className="flex items-center gap-1">
                        {editingDoc?.id === doc.id ? (
                            <>
                            <Button variant="ghost" size="icon" onClick={handleUpdateName}><Save className="h-4 w-4 text-green-500" /></Button>
                            <Button variant="ghost" size="icon" onClick={handleCancelEdit}><X className="h-4 w-4 text-red-500" /></Button>
                            </>
                        ) : (
                            <>
                            <Button variant="ghost" size="icon" onClick={() => handleGenerateQrForSingle(doc)} disabled={!!editingDoc}><QrCode className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleStartEdit(doc)} disabled={!!editingDoc}><FileEdit className="h-4 w-4" /></Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" disabled={!!editingDoc}><Trash2 className="h-4 w-4 text-red-500 hover:text-red-400" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action is permanent and cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(doc.id, doc.storagePath)}>Delete</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            </>
                        )}
                        </div>
                    </div>
                ))}
                {!isLoadingDocuments && !documents?.length && !optimisticUploads.length && (
                    <div className="text-center py-12"><FileText className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">No Documents Found</h3><p className="mt-2 text-sm text-muted-foreground">Click "Upload" to add your first document.</p></div>
                )}
                </div>
            </CardContent>
        </Card>
      </main>

      <Dialog open={!!qrDialogData} onOpenChange={(isOpen) => !isOpen && setQrDialogData(null)}>
        {qrDialogData && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Share: {qrDialogData.name}</DialogTitle>
              <DialogDescription>Scan this QR code to securely access the document(s).</DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center p-4"><QRCode value={qrDialogData.value} size={256} /></div>
            <DialogClose asChild><Button type="button" variant="secondary" className="w-full">Done</Button></DialogClose>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

    