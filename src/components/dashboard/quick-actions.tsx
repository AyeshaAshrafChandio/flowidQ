import Link from "next/link";
import { UploadCloud, QrCode } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const actions = [
  {
    href: "/upload",
    icon: UploadCloud,
    title: "Upload Document",
    color: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-500",
  },
  {
    href: "/scan",
    icon: QrCode,
    title: "Scan QR Code",
    color: "bg-purple-100 dark:bg-purple-900/20",
    iconColor: "text-purple-500",
  },
];

export function QuickActions() {
  return (
    <>
      {actions.map((action) => (
        <Card key={action.href} className="hover:border-primary/50 transition-colors">
          <Link href={action.href}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`flex items-center justify-center rounded-md w-12 h-12 ${action.color}`}
              >
                <action.icon className={`w-6 h-6 ${action.iconColor}`} />
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </>
  );
}
