
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  UploadCloud,
  QrCode,
  Users,
  Settings,
  Badge as BadgeIcon,
  UserCircle,
  LifeBuoy,
  Building,
  ChevronDown,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const userNavItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/documents", icon: FileText, label: "My Documents" },
    { href: "/upload", icon: UploadCloud, label: "Upload Document" },
    { href: "/scan", icon: QrCode, label: "Scan QR" },
    { href: "/queues", icon: Users, label: "Queue Tracker", badge: "3" },
    { href: "/profile", icon: UserCircle, label: "Profile" },
    { href: "/settings", icon: Settings, label: "Settings" },
    { href: "/user-guide", icon: Info, label: "User Guide" },
];

const orgNavItems = [
    { href: "/organization-guide", label: "Guidelines", icon: Info },
    { href: "/organization-profile", label: "Profile & QR Code", icon: Building },
    { href: "/organization-queue", label: "Queue Control", icon: Users },
]

const supportNavItem = { href: "/support", icon: LifeBuoy, label: "Support" };


type AppSidebarNavProps = {
  isMobile?: boolean;
};

export function AppSidebarNav({ isMobile = false }: AppSidebarNavProps) {
  const pathname = usePathname();
  
  const isUserSectionActive = userNavItems.some(item => pathname.startsWith(item.href));
  const [isUserSectionOpen, setIsUserSectionOpen] = useState(isUserSectionActive);
  
  const isOrgSectionActive = orgNavItems.some(item => pathname.startsWith(item.href));
  const [isOrgSectionOpen, setIsOrgSectionOpen] = useState(isOrgSectionActive);

  useEffect(() => {
    setIsUserSectionOpen(isUserSectionActive);
  }, [isUserSectionActive]);

  useEffect(() => {
    setIsOrgSectionOpen(isOrgSectionActive);
  }, [isOrgSectionActive]);

  const NavLink = ({ item, isActive }: { item: { href: string; icon: React.ElementType; label: string; badge?: string; }, isActive: boolean }) => (
     <Link
        href={item.href}
        className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            { "text-primary font-medium": isActive },
            isMobile ? "text-base" : "text-sm"
        )}
    >
        <item.icon className="h-4 w-4" />
        {item.label}
        {item.badge && (
            <BadgeIcon className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {item.badge}
            </BadgeIcon>
        )}
    </Link>
  )

  const NavCollapsible = ({
      title,
      icon: Icon,
      items,
      isOpen,
      setIsOpen,
      isActive,
  } : {
      title: string;
      icon: React.ElementType;
      items: { href: string; icon: React.ElementType; label: string; }[];
      isOpen: boolean;
      setIsOpen: (isOpen: boolean) => void;
      isActive: boolean;
  }) => (
     <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
            <Button
                variant="ghost"
                className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    { "bg-muted text-primary": isActive },
                     isMobile ? "text-lg" : "text-sm",
                     "font-medium"
                )}
            >
                <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {title}
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-8 space-y-1 py-1">
            {items.map((item) => (
                <NavLink key={item.href} item={item} isActive={pathname.startsWith(item.href)} />
            ))}
        </CollapsibleContent>
      </Collapsible>
  );


  return (
    <>
      <NavCollapsible
        title="My Account"
        icon={UserCircle}
        items={userNavItems}
        isOpen={isUserSectionOpen}
        setIsOpen={setIsUserSectionOpen}
        isActive={isUserSectionActive}
      />
      
      <NavCollapsible
        title="Organization"
        icon={Building}
        items={orgNavItems}
        isOpen={isOrgSectionOpen}
        setIsOpen={setIsOrgSectionOpen}
        isActive={isOrgSectionActive}
      />

       <Link
            key={supportNavItem.href}
            href={supportNavItem.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              { "bg-muted text-primary": pathname.startsWith(supportNavItem.href) },
              isMobile && "text-lg"
            )}
          >
            <supportNavItem.icon className="h-4 w-4" />
            {supportNavItem.label}
        </Link>
    </>
  );
}
