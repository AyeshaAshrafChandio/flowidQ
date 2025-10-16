'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanLine, Upload, FileCog, VideoOff, QrCode } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function QrHub() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);
  
  // Cleanup function to stop video tracks when component unmounts or scanning stops
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Run cleanup on unmount


  const startScan = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Camera API not available in this browser.');
      setHasCameraPermission(false);
      toast.error('Camera not supported in this browser.');
      return;
    }
    
    setIsScanning(true);
    setHasCameraPermission(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      setIsScanning(false);
      toast.error('Camera access denied. Please enable it in your browser settings.');
    }
  };
  
  const stopScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
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
        <h1 className="text-3xl font-bold text-center mb-8">
          Welcome, {user.displayName || 'User'}!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* QR Code Scanning Section */}
          <Card className="glowing-border">
            <CardHeader>
              <div className="flex items-center gap-4">
                <ScanLine className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Scan & Go</CardTitle>
                  <CardDescription>Join queues or access documents instantly.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              {isScanning ? (
                <>
                  <div className="w-full aspect-video bg-secondary/50 rounded-md flex items-center justify-center mb-4 relative overflow-hidden">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    {hasCameraPermission === false && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4">
                          <VideoOff className="h-16 w-16 text-muted-foreground mb-4" />
                          <Alert variant="destructive">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                              Please allow camera access in your browser settings to use this feature.
                            </Aler tDescription>
                          </Alert>
                       </div>
                    )}
                     {hasCameraPermission === true && (
                      <div className="absolute inset-0 border-4 border-primary/50 rounded-md animate-pulse"></div>
                     )}
                  </div>
                  <Button onClick={stopScan} variant="outline">Cancel</Button>
                </>
              ) : (
                <div className="text-center">
                   <p className="text-muted-foreground mb-4">Click the button to start scanning a QR code.</p>
                   <Button onClick={startScan}>
                    <ScanLine className="mr-2 h-4 w-4" />
                    Scan QR Code
                   </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document & Sharing Section */}
          <div className="space-y-8">
            <Card className="glowing-border">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <FileCog className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Document Hub</CardTitle>
                    <CardDescription>Manage your secure documents.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-muted-foreground text-sm">
                  Upload, view, and generate secure sharing links for your documents.
                </p>
                <Link href="/documents" passHref>
                  <Button className="w-full">
                    <FileCog className="mr-2 h-4 w-4" />
                    Manage Documents
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="glowing-border">
              <CardHeader>
                  <div className="flex items-center gap-4">
                      <QrCode className="h-8 w-8 text-primary" />
                      <div>
                          <CardTitle>Generate QR Code</CardTitle>
                          <CardDescription>Share your documents securely.</CardDescription>
                      </div>
                  </div>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                      Select documents from your wallet to generate a new secure QR code for sharing.
                  </p>
                  <Link href="/documents" passHref>
                    <Button className="w-full">
                        Generate New QR Code
                    </Button>
                  </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
