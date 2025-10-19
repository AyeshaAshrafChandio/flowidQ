
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UploadCloud,
  FileText,
  QrCode,
  Users,
  UserCircle,
  Sparkles,
} from "lucide-react";

export default function UserGuidePage() {
  return (
    <>
      <PageHeader
        title="Welcome to FlowIDQ!"
        subtitle="A quick guide to using your secure digital wallet."
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <UploadCloud className="h-6 w-6 text-primary" />
              <span>Step 1: Upload Your Documents</span>
            </CardTitle>
            <CardDescription>
              Easily add your important documents to your secure wallet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Navigate to the "Upload Document" page. You can select a file
              from your device (like an image or PDF).
            </p>
            <p>
              Our AI assistant will automatically analyze the document to detect its type (e.g., CNIC, Passport), making organization effortless. Give it a name and save it.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <span>Step 2: Manage & View</span>
            </CardTitle>
            <CardDescription>
              All your uploaded documents are available in one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Go to the "My Documents" page to see a list of everything
              you've saved. You can filter them by category for easy access.
            </p>
            <p>
              From here, you can view, share, or delete documents as needed.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <QrCode className="h-6 w-6 text-primary" />
              <span>Step 3: Share Securely</span>
            </CardTitle>
            <CardDescription>
              Share your data with organizations quickly and securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Use the "Scan QR" feature to scan a code provided by an organization (like a hospital or bank).
            </p>
            <p>
              You'll be prompted to select which documents you wish to share. Only the data you approve will be shared. You can also generate your own QR code from the dashboard to show to others.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <span>Step 4: Join Smart Queues</span>
            </CardTitle>
            <CardDescription>
              Skip the line by joining virtual queues automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              After sharing your documents with a supported organization, you'll be automatically added to their service queue and receive a token number.
            </p>
            <p>
              You can monitor your real-time position and estimated wait time from the "Queue Tracker" page.
            </p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <UserCircle className="h-6 w-6 text-primary" />
                    <span>Your Profile & AI Support</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p><span className="font-semibold text-foreground">CV Profile:</span> Use the "Profile" page to create a professional curriculum vitae. You can edit your personal details, work experience, education, and skills. This profile can be shared just like any other document.</p>
                <p><span className="font-semibold text-foreground">AI Assistant:</span> Have a question? Visit the "Support" page to chat with our AI assistant. It can answer questions about any of the app's features.</p>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
