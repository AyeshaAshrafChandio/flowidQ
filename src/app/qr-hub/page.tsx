'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanLine, FileCog, VideoOff, QrCode, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import jsQR from 'jsqr';

export default function QrHub() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanAnimationRef = useRef<number>();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const stopScan = useCallback(() => {
    if (scanAnimationRef.current) {
      cancelAnimationFrame(scanAnimationRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    // Cleanup function to stop scanning when the component unmounts
    return () => {
      stopScan();
    };
  }, [stopScan]);

  const tick = useCallback(() => {
    if (videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          stopScan();
          toast.success('QR Code detected! Redirecting...');
          router.push(code.data);
          return; // Stop the loop
        }
      }
    }
    scanAnimationRef.current = requestAnimationFrame(tick);
  }, [router, stopScan]);


  const startScan = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Camera not supported in this browser.');
      setHasCameraPermission(false);
      return;
    }
    
    setIsScanning(true);
    setHasCameraPermission(null); // Reset permission state on new scan attempt

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Start the scanning loop
        scanAnimationRef.current = requestAnimationFrame(tick);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      setIsScanning(false);
      toast.error('Camera access denied. Please enable it in your browser settings.');
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
        <h1 className="text-3xl font-bold text-center mb-8">
          Welcome, {user.displayName || 'User'}!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
               <canvas ref={canvasRef} className="hidden" />
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
