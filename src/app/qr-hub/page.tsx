
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
  const animationFrameId = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessingQr, setIsProcessingQr] = useState(false);

  const stopScan = useCallback(() => {
    setIsScanning(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = undefined;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    return () => {
      stopScan();
    };
  }, [user, isUserLoading, router, stopScan]);


  const tick = useCallback(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        if(isScanning) {
            animationFrameId.current = requestAnimationFrame(tick);
        }
        return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code?.data) {
            setIsProcessingQr(true);
            stopScan();
            toast.success('QR Code detected! Redirecting...');
            
            try {
              const url = new URL(code.data);
              if (url.origin === window.location.origin) {
                  router.push(url.pathname + url.search);
              } else {
                  toast.error('QR Code leads to an external website, which is not allowed.');
                  setIsProcessingQr(false);
              }
            } catch (e) {
               toast.error('Invalid QR code data.');
               setIsProcessingQr(false);
            }
            return;
        }
    }
    if (isScanning) {
        animationFrameId.current = requestAnimationFrame(tick);
    }
  }, [isScanning, router, stopScan]);

  const startScan = useCallback(async () => {
    if (isScanning || isProcessingQr) return;
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setHasCameraPermission(true);
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        animationFrameId.current = requestAnimationFrame(tick);
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      setHasCameraPermission(false);
      setIsScanning(false);
      stopScan();
      toast.error('Camera access was denied. Please enable it in your browser settings.');
    }
  }, [isScanning, isProcessingQr, stopScan, tick]);

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
              <div className="w-full aspect-video bg-secondary/50 rounded-md flex items-center justify-center mb-4 relative overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                
                {!isScanning && hasCameraPermission === false && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4 text-center">
                      <VideoOff className="h-16 w-16 text-muted-foreground mb-4" />
                      <Alert variant="destructive">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                          Please allow camera access in your browser settings to scan a QR code.
                        </AlertDescription>
                      </Alert>
                    </div>
                )}
                
                {isScanning && !isProcessingQr && (
                  <div className="absolute inset-0 border-4 border-primary/50 rounded-md animate-pulse"></div>
                )}

                {isProcessingQr && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <p className="mt-4 text-sm text-foreground">Processing QR Code...</p>
                    </div>
                )}

                {!isScanning && !isProcessingQr && (
                   <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                     <QrCode className="h-24 w-24 text-muted-foreground/50"/>
                   </div>
                )}
              </div>
              
              {isScanning ? (
                  <Button onClick={stopScan} variant="outline" disabled={isProcessingQr}>Cancel Scan</Button>
              ) : (
                <Button onClick={startScan} disabled={isProcessingQr}>
                  <ScanLine className="mr-2 h-4 w-4" />
                  {isProcessingQr ? 'Processing...' : 'Scan QR Code'}
                </Button>
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
