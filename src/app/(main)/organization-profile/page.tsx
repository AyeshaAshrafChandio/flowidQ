
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building, QrCode, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialOrgData = {
  id: "City_Hospital",
  name: "City Hospital",
  description: "A leading healthcare provider in the metropolitan area, offering a wide range of medical services, from emergency care to specialized treatments. Our mission is to provide compassionate and high-quality healthcare to our community.",
  logoUrl: "https://picsum.photos/seed/org1/200/200"
};

export default function OrganizationProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [orgData, setOrgData] = useState(initialOrgData);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const getLocalStorageKey = () => `qrCodeUrl_${orgData.id}`;

  useEffect(() => {
    // On component mount, check if a QR code URL is already saved in localStorage.
    const savedQrUrl = localStorage.getItem(getLocalStorageKey());
    if (savedQrUrl) {
      setQrCodeUrl(savedQrUrl);
    }
  }, [orgData.id]);


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setOrgData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    // In a real app, you would save this data to your backend (e.g., Firestore)
    toast({
      title: "Profile Updated",
      description: "Your organization's information has been saved.",
    });
     // Reset QR code if data that might affect it has changed
     if (localStorage.getItem(getLocalStorageKey())) {
        localStorage.removeItem(getLocalStorageKey());
        setQrCodeUrl(null);
     }
  };

  const handleGenerateQrCode = () => {
    const orgQrData = `orgId:${orgData.id}:queue_enabled`;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(orgQrData)}`;
    setQrCodeUrl(url);
    localStorage.setItem(getLocalStorageKey(), url); // Save to localStorage
    toast({
      title: "QR Code Generated",
      description: "You can now save the QR code image.",
    });
  }

  const handleSaveQrCode = () => {
    if (!qrCodeUrl) return;

    try {
        // Create a direct download link by adding the download parameter to the API URL
        const downloadUrl = `${qrCodeUrl}&download=1`;

        // Create a temporary link element to trigger the download
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Suggest a filename for the downloaded file
        link.download = `${orgData.name.replace(/\s+/g, '_')}-qr-code.png`;
        
        // Append the link to the body, click it, and then remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error("Error preparing QR code for download:", error);
        toast({
            variant: "destructive",
            title: "Download Failed",
            description: "Could not prepare the QR code for download. Please try right-clicking to save.",
        });
    }
  };


  return (
    <>
      <PageHeader
        title="Organization Profile"
        subtitle="Manage your organization's public information."
      >
        {isEditing ? (
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </PageHeader>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                <div className="flex items-center gap-4">
                    <Building className="h-10 w-10 text-primary" />
                    <div>
                    {isEditing ? (
                        <Input
                        name="name"
                        value={orgData.name}
                        onChange={handleInputChange}
                        className="text-2xl font-bold"
                        />
                    ) : (
                        <CardTitle>{orgData.name}</CardTitle>
                    )}
                    <CardDescription>
                        Update your organization's name and description.
                    </CardDescription>
                    </div>
                </div>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h3 className="font-semibold">Description</h3>
                    {isEditing ? (
                    <Textarea
                        name="description"
                        value={orgData.description}
                        onChange={handleInputChange}
                        rows={5}
                        className="text-base"
                    />
                    ) : (
                    <p className="text-muted-foreground">{orgData.description}</p>
                    )}
                </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <QrCode />
                        <span>Queue QR Code</span>
                    </CardTitle>
                    <CardDescription>
                        Generate a QR code for users to join your queue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4">
                    <div className="p-4 bg-white rounded-lg border printable flex items-center justify-center h-[232px] w-[232px]">
                         {qrCodeUrl ? (
                            <Image
                                src={qrCodeUrl}
                                alt={`${orgData.name} QR Code`}
                                width={200}
                                height={200}
                                data-ai-hint="qr code organization"
                            />
                         ) : (
                            <div className="text-center text-muted-foreground p-4">
                                <p>Click the button below to generate your QR code.</p>
                            </div>
                         )}
                    </div>
                    {!qrCodeUrl ? (
                        <Button onClick={handleGenerateQrCode} className="w-full non-printable">
                            Generate QR Code
                        </Button>
                    ) : (
                        <div className="w-full space-y-2 non-printable">
                            <Button className="w-full" onClick={handleSaveQrCode}>
                                <Download className="mr-2 h-4 w-4" />
                                Save QR Code
                            </Button>
                             <p className="text-xs text-center text-muted-foreground">
                                You can also right-click the image to save.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
