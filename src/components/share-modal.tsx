'use client';

import { useState } from 'react';
import Image from 'next/image';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Shield, KeyRound, Copy, Check } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { generateSecureQRCode } from '@/ai/flows/secure-qr-code-generation';

type ShareModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  document: { id: string; name: string };
};

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function ShareModal({ isOpen, setIsOpen, document }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<'password' | 'otp'>('password');
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{
    qrCodeDataUri: string;
    accessDetails: string;
  } | null>(null);
  const [otp, setOtp] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '' },
  });

  const handleGenerateOtp = () => {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(generatedOtp);
  };

  const handleGenerateQr = async (values?: z.infer<typeof passwordSchema>) => {
    setLoading(true);
    setQrCodeData(null);
    try {
      const input = {
        documentId: document.id,
        securityType: activeTab,
        ...(activeTab === 'password' && { password: values?.password }),
        ...(activeTab === 'otp' && { otp }),
      };

      if (activeTab === 'otp' && !otp) {
        toast({ title: 'Please generate an OTP first.', variant: 'destructive' });
        setLoading(false);
        return;
      }

      const result = await generateSecureQRCode(input);
      setQrCodeData(result);
    } catch (error: any) {
      toast({
        title: 'Failed to generate QR code',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (qrCodeData?.accessDetails) {
        navigator.clipboard.writeText(qrCodeData.accessDetails);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetState = () => {
    setQrCodeData(null);
    setOtp('');
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetState();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Share "{document.name}"</DialogTitle>
          <DialogDescription>
            Generate a secure QR code to share your document.
          </DialogDescription>
        </DialogHeader>
        
        {!qrCodeData ? (
          <Tabs defaultValue="password" onValueChange={(value) => setActiveTab(value as 'password' | 'otp')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">
                <KeyRound className="mr-2 h-4 w-4" /> Password
              </TabsTrigger>
              <TabsTrigger value="otp">
                <Shield className="mr-2 h-4 w-4" /> OTP
              </TabsTrigger>
            </TabsList>
            <TabsContent value="password">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleGenerateQr)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Set a Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Min. 8 characters" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Generate QR Code
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="otp">
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <Input readOnly value={otp} placeholder="Click generate to get an OTP" />
                  <Button variant="outline" onClick={handleGenerateOtp}>Generate</Button>
                </div>
                <DialogFooter>
                  <Button onClick={() => handleGenerateQr()} disabled={loading || !otp} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate QR Code
                  </Button>
                </DialogFooter>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-4 text-center space-y-4">
             {loading ? (
                <Skeleton className="w-64 h-64 mx-auto" />
             ) : (
                <div className="flex justify-center bg-white p-4 rounded-lg">
                    <Image src={qrCodeData.qrCodeDataUri} alt="Secure QR Code" width={256} height={256} />
                </div>
             )}
            <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground relative">
                <p>{qrCodeData.accessDetails}</p>
                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
            <Button onClick={resetState} variant="outline">Share another way</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
