
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Camera, HelpCircle, VideoOff, Loader2, ScanLine, FileText, Clock, KeyRound, MessageSquare } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getDocuments, initialQueueData } from "@/lib/data";
import type { Document } from "@/lib/types";

export default function ScanPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<Record<string, boolean>>({});
  const [verificationMethod, setVerificationMethod] = useState<'otp' | 'password' | null>(null);
  const [shareTime, setShareTime] = useState<Date | null>(null);
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setUserDocuments(getDocuments());
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraOn(false);
      setIsScanning(false);
    }
  };

  const startCamera = async () => {
    if (streamRef.current) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCameraPermission(false);
      toast({
        variant: "destructive",
        title: "Unsupported Browser",
        description: "Your browser does not support camera access.",
      });
      return;
    }
    try {
      setHasCameraPermission(null); // Reset permission state
      setIsScanning(true); // Show loading state
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setHasCameraPermission(true);
      setCameraOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setHasCameraPermission(false);
      setIsScanning(false);
      toast({
        variant: "destructive",
        title: "Camera Access Denied",
        description: "Please enable camera permissions in your browser settings.",
      });
    }
  };
  
  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let scanTimeout: NodeJS.Timeout;
    if (isScanning && cameraOn) {
      // Simulate scanning for a QR code
      toast({
          title: "Scanning in progress...",
          description: "Hold your device steady.",
      });
      scanTimeout = setTimeout(() => {
        setIsScanning(false);
        setScannedData("orgId:City_Hospital:queue_enabled"); // Example data with queue info
        setShareTime(new Date());
        toast({
          title: "Scan complete!",
          description: "Processing your data...",
        });
        setTimeout(() => stopCamera(), 500); // Turn off camera shortly after scan
      }, 3000); // Simulate a 3-second scan
    }
    return () => clearTimeout(scanTimeout);
  }, [isScanning, cameraOn, toast]);

  const handleShare = () => {
    const docsToShare = Object.keys(selectedDocs).filter(id => selectedDocs[id]);
    console.log("Sharing documents:", docsToShare, "with:", scannedData);
    
    toast({
      title: "Data Shared Successfully",
      description: `Selected documents have been securely shared.`,
    });

    if (scannedData?.includes('queue_enabled')) {
      const orgName = scannedData.split(':')[1].replace('_', ' ');
      
      if(initialQueueData.organizationName === orgName) {
        const lastToken = initialQueueData.waiting[initialQueueData.waiting.length - 1]?.token || initialQueueData.upNext[initialQueueData.upNext.length - 1]?.token || initialQueueData.nowServing.token;
        const newToken = lastToken + 1;
        
        // This is a mock implementation. In a real app, this would be an API call.
        initialQueueData.waiting.push({ token: newToken, userName: 'New User' });

        setTimeout(() => {
          toast({
            title: "Queue Joined!",
            description: `You've joined the queue for ${orgName}. Your token is ${newToken}.`,
          });
        }, 1000);
      }
    }


    setScannedData(null);
    setSelectedDocs({});
    setVerificationMethod(null);
  };

  const handleCloseDialog = () => {
    setScannedData(null);
    setSelectedDocs({});
    setVerificationMethod(null);
  };
  
  const handleScanAgain = () => {
    setScannedData(null);
    startCamera();
  };

  return (
    <>
      <PageHeader
        title="Scan QR Code"
        subtitle="Scan a code to connect with an organization or share documents."
      />
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 flex flex-col items-center gap-6">
            <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden relative">
              {cameraOn ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  {isScanning && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                      <ScanLine className="h-24 w-24 text-white/50 animate-pulse" />
                      <p className="mt-4 text-white font-semibold">Scanning...</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground/50">
                   {hasCameraPermission === null && isScanning ? (
                    <Loader2 className="h-24 w-24 animate-spin" />
                  ) : (
                    <VideoOff className="h-24 w-24" />
                  )}
                   <p className="mt-2 text-center px-4">
                    {hasCameraPermission === null && isScanning
                      ? "Requesting camera access..."
                      : "Camera is off. Press 'Start Scan' to begin."}
                  </p>
                </div>
              )}
            </div>

            {hasCameraPermission === false && (
              <Alert variant="destructive">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser settings to use this feature.
                </AlertDescription>
              </Alert>
            )}

            {scannedData ? (
                <Button onClick={handleScanAgain} className="w-full">
                    <Camera className="mr-2 h-5 w-5" />
                    Scan Again
                </Button>
            ) : cameraOn ? (
              <Button onClick={stopCamera} variant="outline" className="w-full">
                <VideoOff className="mr-2 h-5 w-5" />
                Stop Camera
              </Button>
            ) : (
               <Button onClick={startCamera} className="w-full" disabled={isScanning}>
                <Camera className="mr-2 h-5 w-5" />
                {isScanning ? "Starting..." : "Start Scan"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!scannedData} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Secure Document Sharing</DialogTitle>
            <DialogDescription>
              Verify your identity and select the documents you want to share with the organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-4">
                <Label>Verification Method</Label>
                {!verificationMethod ? (
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" onClick={() => setVerificationMethod('otp')}>
                            <MessageSquare className="mr-2 h-4 w-4"/>
                            Generate OTP
                        </Button>
                         <Button variant="outline" onClick={() => setVerificationMethod('password')}>
                            <KeyRound className="mr-2 h-4 w-4"/>
                            Use Password
                        </Button>
                    </div>
                ) : verificationMethod === 'otp' ? (
                     <div className="grid gap-3">
                        <Label htmlFor="otp">One-Time Password</Label>
                        <Input id="otp" type="text" placeholder="Enter OTP" />
                        <p className="text-xs text-muted-foreground">An OTP has been sent to your registered number.</p>
                    </div>
                ) : (
                     <div className="grid gap-3">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="Enter your password" />
                    </div>
                )}
            </div>
            
            <div className="grid gap-4">
                <h3 className="font-medium">Select Documents to Share:</h3>
                <div className="space-y-3 rounded-md border p-4 max-h-48 overflow-y-auto">
                    {userDocuments.map(doc => (
                        <div key={doc.id} className="flex items-center space-x-3">
                            <Checkbox 
                                id={doc.id} 
                                checked={selectedDocs[doc.id] || false}
                                onCheckedChange={(checked) => setSelectedDocs(prev => ({ ...prev, [doc.id]: !!checked }))}
                            />
                            <Label htmlFor={doc.id} className="flex items-center gap-2 font-normal cursor-pointer">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                {doc.name}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {shareTime && (
                <div className="flex items-center justify-center text-sm text-muted-foreground gap-2">
                    <Clock className="h-4 w-4"/>
                    <span>Sharing at: {shareTime.toLocaleString()}</span>
                </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={Object.values(selectedDocs).every(v => !v) || !verificationMethod}>
              Share Securely
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
