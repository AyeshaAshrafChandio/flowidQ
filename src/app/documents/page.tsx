'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Trash2, Loader2, QrCode, X, Edit, Save, FileEdit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { collection, query, orderBy, serverTimestamp, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { analyzeDocument } from '@/ai/flows/document-analyzer-flow';


export default function DocumentsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const storage = getStorage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [generatedQrValue, setGeneratedQrValue] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingDocName, setEditingDocName] = useState('');

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
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File is too large. Maximum size is 10MB.');
        return;
      }
      setSelectedFile(file);
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    if (!user || !firestore) {
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
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          const documentsColRef = collection(firestore, 'users', user.uid, 'documents');
          const docRef = await addDoc(documentsColRef, {
            name: file.name,
            fileUrl: downloadURL,
            storagePath: storageRef.fullPath,
            uploadDate: serverTimestamp(),
            category: file.type,
            isEncrypted: true,
            userId: user.uid,
          });

          toast.success('Document uploaded successfully!');
          
          if (file.type.startsWith('image/')) {
            toast.loading('AI is analyzing your document...');
            try {
              const dataUri = await fileToDataURI(file);
              const analysisResult = await analyzeDocument({ photoDataUri: dataUri });
              
              await updateDoc(docRef, {
                  aiAnalysis: analysisResult
              });
              
              toast.dismiss();
              toast.success(`AI detected: ${analysisResult.documentType}`);
              console.log('AI Analysis:', analysisResult);

            } catch (aiError) {
              console.error("AI analysis failed:", aiError);
              toast.dismiss();
              toast.error('AI analysis failed.');
            }
          }
          
          // Reset state after everything is done
          setIsUploading(false);
          setUploadProgress(null);
          setSelectedFile(null);
        });
      }
    );
  };

  const handleDelete = async (docId: string, storagePath: string) => {
    if (!user || !firestore) return;
    
    const docRef = doc(firestore, 'users', user.uid, 'documents', docId);
    const storageRef = ref(storage, storagePath);

    try {
      await deleteDoc(docRef);
      await deleteObject(storageRef);
      toast.success('Document deleted successfully.');
      setSelectedDocs(prev => prev.filter(id => id !== docId));
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document.');
    }
  };
  
  const handleEdit = (doc: { id: string, name: string }) => {
    setEditingDocId(doc.id);
    setEditingDocName(doc.name);
  };

  const handleCancelEdit = () => {
    setEditingDocId(null);
    setEditingDocName('');
  };

  const handleUpdateName = async (docId: string) => {
    if (!user || !firestore || !editingDocName.trim()) {
      toast.error('Document name cannot be empty.');
      return;
    }
    
    const docRef = doc(firestore, 'users', user.uid, 'documents', docId);
    
    try {
      await updateDoc(docRef, { name: editingDocName });
      toast.success('Document renamed successfully.');
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating document name:', error);
      toast.error('Failed to rename document.');
    }
  };

  const handleGenerateQrCode = async () => {
    if (selectedDocs.length === 0 || !user || !firestore) {
      toast.error('Please select at least one document to generate a QR code.');
      return;
    }

    try {
      const qrData = {
        userId: user.uid,
        documentIds: selectedDocs,
        timestamp: Date.now(),
      };
      
      const qrValue = `${window.location.origin}/verify?data=${btoa(JSON.stringify(qrData))}`;
      setGeneratedQrValue(qrValue);

    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error('Failed to generate QR code.');
    }
  };

  const handleDocSelection = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
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
        <div className="flex justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Document Wallet</h1>
          <div className="flex gap-2">
             <Dialog onOpenChange={(isOpen) => !isOpen && setGeneratedQrValue(null)}>
              <DialogTrigger asChild>
                <Button onClick={handleGenerateQrCode} disabled={selectedDocs.length === 0 || isUploading}>
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR Code
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Share Documents</DialogTitle>
                  <DialogDescription>
                    Scan this QR code to securely access the selected documents.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center p-4">
                  {generatedQrValue ? (
                    <QRCode value={generatedQrValue} size={256} />
                  ) : (
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  )}
                </div>
                 <DialogClose asChild>
                    <Button type="button" variant="secondary" className="w-full">
                      Done
                    </Button>
                  </DialogClose>
              </DialogContent>
            </Dialog>
            <Button onClick={handleFileSelect} disabled={isUploading}>
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload
            </Button>
          </div>
          <Input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,.pdf,.doc,.docx"
          />
        </div>

        {isUploading && selectedFile && (
          <div className="mb-8 p-4 rounded-lg border">
            <p className="font-medium mb-2">Uploading: {selectedFile.name}</p>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full w-full flex-1 bg-primary transition-all"
                style={{ transform: `translateX(-${100 - (uploadProgress || 0)}%)` }}
              />
            </div>
          </div>
        )}

        <Card className="glowing-border">
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>
              Select, edit, and manage your documents. Generate a QR code to share.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingDocuments && 
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }
              {!isLoadingDocuments && documents && documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                    <div className="flex items-center gap-4 flex-grow">
                      <Checkbox
                        id={`select-${doc.id}`}
                        checked={selectedDocs.includes(doc.id)}
                        onCheckedChange={() => handleDocSelection(doc.id)}
                        aria-label={`Select document ${doc.name}`}
                        disabled={!!editingDocId}
                      />
                      <FileText className="h-6 w-6 text-primary" />
                      {editingDocId === doc.id ? (
                        <div className="flex-grow flex items-center gap-2">
                           <Input 
                             value={editingDocName}
                             onChange={(e) => setEditingDocName(e.target.value)}
                             className="h-8"
                             autoFocus
                           />
                        </div>
                      ) : (
                        <div>
                          <label htmlFor={`select-${doc.id}`} className="font-medium cursor-pointer">{doc.name}</label>
                          <p className="text-sm text-muted-foreground">
                            Uploaded on {doc.uploadDate ? new Date(doc.uploadDate.seconds * 1000).toLocaleDateString() : 'Just now'}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {editingDocId === doc.id ? (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleUpdateName(doc.id)}>
                            <Save className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(doc)}>
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500 hover:text-red-400" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete your
                                  document and remove your data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(doc.id, doc.storagePath)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                !isLoadingDocuments && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Documents Found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Click "Upload" to add your first document.</p>
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
