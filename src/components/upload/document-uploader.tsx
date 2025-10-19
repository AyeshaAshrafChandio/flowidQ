"use client";

import { useFormStatus } from "react-dom";
import { handleDocumentUpload } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadCloud, FileCheck2, Loader2, AlertCircle, Save, FileText, GraduationCap, HeartPulse, Briefcase } from "lucide-react";
import { useState, useRef, useEffect, useActionState } from "react";
import Image from "next/image";
import { Progress } from "../ui/progress";
import { Label } from "../ui/label";
import { addDocument, getDocumentTypeIcon } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@/lib/types";

const initialState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        "Analyze Document"
      )}
    </Button>
  );
}

export function DocumentUploader() {
  const [state, formAction] = useActionState(handleDocumentUpload, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [docName, setDocName] = useState<string>("");
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Use the file name (without extension) as the default document name
      const nameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
      setDocName(nameWithoutExtension);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        if (hiddenInputRef.current) {
          hiddenInputRef.current.value = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleReset = () => {
    setPreview(null);
    setFileName("");
    setDocName("");
    if (formRef.current) {
      formRef.current.reset();
    }
    if (hiddenInputRef.current) {
        hiddenInputRef.current.value = "";
    }
    // A trick to reset the form state by re-triggering the form action with empty data
    formAction(new FormData());
  };

  const handleSaveDocument = () => {
    if (!state.result || !docName) {
      toast({
        variant: "destructive",
        title: "Cannot Save Document",
        description: "Document name and analysis results are required.",
      });
      return;
    }
    
    // Convert AI-detected type to one of our app's categories
    const docTypeMap: Record<string, Document['type']> = {
      'cnic': 'Personal',
      'passport': 'Personal',
      'drivers license': 'Personal',
      'degree': 'Education',
      'certificate': 'Education',
      'health insurance': 'Health',
      'medical record': 'Health',
      'contract': 'Official',
      'official letter': 'Official',
    };
    
    const detectedTypeKey = state.result.documentType.toLowerCase();
    const docType: Document['type'] = docTypeMap[detectedTypeKey] || 'Personal';


    const newDoc: Document = {
      id: `doc_${Date.now()}`,
      name: docName,
      type: docType,
      uploadDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      icon: getDocumentTypeIcon(docType),
    };

    addDocument(newDoc);

    toast({
      title: "Document Saved!",
      description: `${docName} has been added to your documents.`,
    });

    handleReset();
  };


  return (
    <Card>
      <form ref={formRef} action={formAction}>
        <CardHeader>
          <CardTitle>AI Document Scanner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!preview ? (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, or PDF (MAX. 5MB)
                  </p>
                </div>
                <Input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, application/pdf"
                />
              </label>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="relative w-full h-48">
                <Image
                  src={preview}
                  alt="Document preview"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          )}
          <input type="hidden" name="document" ref={hiddenInputRef} />
          {fileName && !state.result && (
            <div className="text-sm text-center text-muted-foreground">
              File: {fileName}
            </div>
          )}

          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state?.result && (
            <div className="space-y-4">
              <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <FileCheck2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-300">Analysis Complete</AlertTitle>
                <AlertDescription>
                  <div className="grid gap-2 mt-2">
                      <div className="flex justify-between">
                          <span className="font-medium">Detected Type:</span>
                          <span className="font-semibold text-green-700 dark:text-green-400">{state.result.documentType}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-sm">
                              <span className="font-medium">Confidence:</span>
                              <span className="font-semibold">{Math.round(state.result.confidence * 100)}%</span>
                          </div>
                           <Progress value={state.result.confidence * 100} />
                      </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="docName">Document Name</Label>
                <Input
                  id="docName"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Enter a name for this document"
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
          {(preview || state.result || state.error) && (
            <Button variant="outline" onClick={handleReset} type="button" className="w-full sm:w-auto">
              Reset
            </Button>
          )}
          {preview && !state.result ? <SubmitButton /> : null}

          {state.result && (
            <Button onClick={handleSaveDocument} type="button" className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Save Document
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
