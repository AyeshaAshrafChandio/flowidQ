
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import {
  MoreVertical,
  Share2,
  Trash2,
  Eye,
} from "lucide-react";
import { getDocuments } from "@/lib/data";
import type { Document } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const categories = ["All", "Personal", "Education", "Health", "Official"];

  useEffect(() => {
    setDocuments(getDocuments());
  }, []);


  const getFilteredDocuments = (category: string) => {
    if (category === "All") return documents;
    return documents.filter((doc) => doc.type === category);
  };

  return (
    <>
      <PageHeader
        title="My Documents"
        subtitle="Manage and organize your uploaded documents."
      >
        <Button asChild>
          <Link href="/upload">Upload New</Link>
        </Button>
      </PageHeader>
      <Tabs defaultValue="All" className="flex-1">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-4">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat} value={cat}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {getFilteredDocuments(cat).map((doc) => (
                <Card key={doc.id}>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-md">
                        <doc.icon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{doc.name}</CardTitle>
                        <CardDescription className="text-xs">
                          Uploaded: {doc.uploadDate}
                        </CardDescription>
                      </div>
                    </div>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                        <DropdownMenuItem><Share2 className="mr-2 h-4 w-4" />Share</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                </Card>
              ))}
            </div>
             {getFilteredDocuments(cat).length === 0 && (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">No documents in this category.</p>
                </div>
             )}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
