'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, File } from 'lucide-react';
import { ShareModal } from '@/components/share-modal';

type Document = {
  id: string;
  name: string;
  type: string;
  size: string;
  modified: string;
  status: 'Secured' | 'Shared';
};

const documents: Document[] = [
  { id: 'doc-1', name: 'Passport_Scan.pdf', type: 'PDF', size: '2.3 MB', modified: '2023-10-26', status: 'Secured' },
  { id: 'doc-2', name: 'Apartment_Lease_Agreement.docx', type: 'DOCX', size: '1.1 MB', modified: '2023-10-24', status: 'Shared' },
  { id: 'doc-3', name: 'Medical_Insurance.png', type: 'PNG', size: '800 KB', modified: '2023-10-20', status: 'Secured' },
  { id: 'doc-4', name: 'Company_Financials_Q3.xlsx', type: 'XLSX', size: '5.6 MB', modified: '2023-10-15', status: 'Secured' },
  { id: 'doc-5', name: 'Birth_Certificate.pdf', type: 'PDF', size: '1.5 MB', modified: '2023-10-12', status: 'Secured' },
];

export default function DocumentsPage() {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleShareClick = (doc: Document) => {
    setSelectedDocument(doc);
    setIsShareModalOpen(true);
  };

  return (
    <>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">My Documents</h2>
            <p className="text-muted-foreground">
              Manage and secure your digital documents.
            </p>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>

        <div className="rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Size</TableHead>
                <TableHead className="hidden lg:table-cell">Last Modified</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                     <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <span>{doc.name}</span>
                      </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{doc.type}</TableCell>
                  <TableCell className="hidden md:table-cell">{doc.size}</TableCell>
                  <TableCell className="hidden lg:table-cell">{doc.modified}</TableCell>
                  <TableCell>
                    <Badge variant={doc.status === 'Shared' ? 'secondary' : 'default'}>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShareClick(doc)}>Share</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {selectedDocument && (
        <ShareModal
          isOpen={isShareModalOpen}
          setIsOpen={setIsShareModalOpen}
          document={selectedDocument}
        />
      )}
    </>
  );
}
