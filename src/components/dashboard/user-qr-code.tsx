
"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { Share2, FileText, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect } from "react";
import { getDocuments } from "@/lib/data";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import type { Document } from "@/lib/types";

export function UserQrCode() {
  const { toast } = useToast();
  const userId = "FlowIDQ-UserID-12345";
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Record<string, boolean>>({});
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    setDocuments(getDocuments());
  }, []);

  const selectedDocIds = useMemo(
    () => Object.keys(selectedDocs).filter((id) => selectedDocs[id]),
    [selectedDocs]
  );

  const generateQrCode = () => {
    const data = {
      userId,
      documents: selectedDocIds,
      timestamp: Date.now(),
    };
    const payload = encodeURIComponent(JSON.stringify(data));
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${payload}`);
  };

  const handleShare = async () => {
    if (!qrCodeUrl) return;

    const shareData = {
      title: "My FlowIDQ Code",
      text: `Sharing ${selectedDocIds.length} document(s) via FlowIDQ.`,
      url: window.location.origin, // You might want to share a link that can decode the payload
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        throw new Error("Web Share API not supported");
      }
    } catch (err) {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(JSON.stringify({ userId, documents: selectedDocIds }));
        toast({
          title: "Copied to Clipboard",
          description: "Your sharing data has been copied.",
        });
      } catch (copyError) {
        toast({
          variant: "destructive",
          title: "Sharing Failed",
          description: "Could not share or copy the code. Please try again.",
        });
      }
    }
  };
  
  const handleCheckedChange = (docId: string) => (checked: boolean) => {
    setSelectedDocs(prev => ({ ...prev, [docId]: !!checked }));
    setQrCodeUrl(null); // Reset QR code when selection changes
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your FlowIDQ Code</CardTitle>
        <CardDescription>
          Select documents below to generate a shareable QR code.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="p-4 bg-white rounded-lg border flex items-center justify-center w-[182px] h-[182px]">
          {qrCodeUrl ? (
            <Image
                src={qrCodeUrl}
                alt="User QR Code"
                width={150}
                height={150}
                data-ai-hint="qr code"
                key={qrCodeUrl} // Re-render image when url changes
            />
          ) : (
             <div className="text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                <QrCode className="h-10 w-10" />
                <p>QR Code will appear here</p>
             </div>
          )}
        </div>

        <div className="w-full space-y-2">
            <Label>Select documents to share:</Label>
            <ScrollArea className="h-32 w-full rounded-md border p-4">
                 {documents.map(doc => (
                    <div key={doc.id} className="flex items-center space-x-3 mb-2">
                        <Checkbox 
                            id={`doc-share-${doc.id}`}
                            checked={selectedDocs[doc.id] || false}
                            onCheckedChange={handleCheckedChange(doc.id)}
                        />
                        <Label htmlFor={`doc-share-${doc.id}`} className="flex items-center gap-2 font-normal cursor-pointer text-sm">
                            <doc.icon className="h-4 w-4 text-muted-foreground" />
                            {doc.name}
                        </Label>
                    </div>
                ))}
            </ScrollArea>
        </div>

        {!qrCodeUrl ? (
            <Button className="w-full" onClick={generateQrCode} disabled={selectedDocIds.length === 0}>
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Code
            </Button>
        ) : (
            <Button className="w-full" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share My Code
            </Button>
        )}
      </CardContent>
    </Card>
  );
}
