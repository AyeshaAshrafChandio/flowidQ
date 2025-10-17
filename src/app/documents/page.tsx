
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Trash2, Loader2, QrCode, X, FileEdit, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { collection, query, orderBy, serverTimestamp, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { analyzeDocument } from '@/ai/flows/document-analyzer-flow';

export default function DocumentsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const files = event.target.files;
    if (files && files.length > 0) {
        handleUpload(files[0]);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (file: File) => {
    if (!user || !firestore) {
      toast.error('You must be logged in to upload documents.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error(`File "${file.name}" is too large. Maximum size is 10MB.`);
      return;
    }

    const toastId = toast.loading(`Uploading "${file.name}"...`);

    try {
        const storage = getStorage();
        const storageRef = ref(storage, `documents/${user.uid}/${Date.now()}_${file.name}`);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        const docData = {
          name: file.name,
          fileUrl: downloadURL,
          storagePath: storageRef.fullPath,
          uploadDate: serverTimestamp(),
          category: file.type,
          userId: user.uid,
        };

        const docRef = await addDoc(collection(firestore, 'users', user.uid, 'documents'), docData);
        
        toast.success(`"${file.name}" uploaded successfully.`, { id: toastId });

        if (file.type.startsWith('image/')) {
            fileToDataURI(file).then(dataUri => {
                analyzeDocument({ photoDataUri: dataUri }).then(analysisResult => {
                    updateDoc(docRef, { aiAnalysis: analysisResult });
                }).catch(aiError => {
                    console.warn("Background AI analysis failed:", aiError);
                });
            });
        }

    } catch (error) {
        console.error("Upload failed:", error);
        toast.error(`Upload of "${file.name}" failed.`, { id: toastId });
    }
  };
  
  const handleDelete = async (docId: string, storagePath: string) => {
    if (!user || !firestore) return;
    
    const toastId = toast.loading("Deleting document...");
    try {
      const storage = getStorage();
      const docRef = doc(firestore, 'users', user.uid, 'documents', docId);
      const storageRef = ref(storage, storagePath);
      
      await deleteObject(storageRef);
      await deleteDoc(docRef);

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
    
  const handleGenerateQrForSelected = () => {
    if (selectedDocs.length === 0) {
      toast.error('Please select at least one document to share.');
      return;
    }
    const qrValue = generateQrValue(selectedDocs);
    const docName = selectedDocs.length > 1 ? `${selectedDocs.length} Documents` : documents?.find(d => d.id === selectedDocs[0])?.name || 'Document';
    setQrDialogData({ value: qrValue, name: docName });
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
             <Button onClick={handleGenerateQrForSelected} disabled={selectedDocs.length === 0}>
                <QrCode className="mr-2 h-4 w-4" />
                Share Selected ({selectedDocs.length})
              </Button>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
          <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.doc,.docx" />
        </div>

        <Card className="glowing-border">
            <CardHeader>
                <CardTitle>Your Documents</CardTitle>
                <CardDescription>Select documents to generate a QR code for sharing.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                
                {isLoadingDocuments && (
                     <div className="text-center py-12">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Loading Documents...</h3>
                    </div>
                )}
                
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

                {!isLoadingDocuments && !documents?.length && (
                    <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Documents Found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Click "Upload Document" to add your first file.
                        </p>
                    </div>
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

    