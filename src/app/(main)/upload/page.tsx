import { PageHeader } from "@/components/page-header";
import { DocumentUploader } from "@/components/upload/document-uploader";

export default function UploadPage() {
  return (
    <>
      <PageHeader
        title="Upload Document"
        subtitle="Use our AI to automatically detect the document type."
      />
      <div className="w-full max-w-2xl mx-auto">
        <DocumentUploader />
      </div>
    </>
  );
}
