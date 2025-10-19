
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info, Building, Users, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function OrganizationGuidePage() {
  return (
    <>
      <PageHeader
        title="Organization Portal Guide"
        subtitle="Important information for institutional users of FlowIDQ."
      />

      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>For Authorized Institutions Only</AlertTitle>
          <AlertDescription>
            This section is intended solely for registered organizations, such
            as hospitals, banks, government offices, and other service
            providers. It is not for individual user access.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Building className="h-6 w-6 text-primary" />
                <span>Profile & QR Code Management</span>
              </CardTitle>
              <CardDescription>
                Manage your organization's public-facing information and
                generate your unique queue QR code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                In the "Profile & QR Code" section, you can update your
                organization's name and description.
              </p>
              <p>
                You can also generate and save a QR code. When users scan this
                code, they can securely share their documents and join your
                service queue.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <span>Queue Control</span>
              </CardTitle>
              <CardDescription>
                Manage the flow of users in your queue in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                The "Queue Control" dashboard provides a live view of the users
                waiting for your service.
              </p>
              <p>
                You can see who is currently being served, who is next in line,
                and the full list of waiting users. Use the "Next Customer"
                button to advance the queue.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Info className="h-5 w-5" />
              <span>How It Works for Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              An individual user will scan your organization's QR code using the
              FlowIDQ app on their phone.
            </p>
            <p>
              They will be prompted to select which documents they wish to
              share with you (e.g., their CNIC or passport). After they approve,
              their information is securely transferred, and they are
              automatically assigned a token number and added to your queue.
            </p>
            <p>
              This automated process enhances security, reduces manual data
              entry, and improves efficiency for both your staff and your
              customers.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
