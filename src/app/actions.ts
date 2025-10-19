
"use server";

import { detectDocumentType, type DetectDocumentTypeInput, type DetectDocumentTypeOutput } from "@/ai/flows/auto-detect-document-type";
import { answerSupportQuestion, type SupportQuestionInput } from "@/ai/flows/support-chat-flow";
import { z } from "zod";

const docUploadFormSchema = z.object({
  document: z.string().min(1, "Document is required."),
});

type DocUploadState = {
  message?: string;
  result?: DetectDocumentTypeOutput;
  error?: string;
};

export async function handleDocumentUpload(
  prevState: DocUploadState,
  formData: FormData
): Promise<DocUploadState> {
  const validatedFields = docUploadFormSchema.safeParse({
    document: formData.get("document"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid input. Please upload a document.",
    };
  }

  try {
    const input: DetectDocumentTypeInput = { documentDataUri: validatedFields.data.document };
    const result = await detectDocumentType(input);

    return {
      message: "Document analyzed successfully.",
      result,
    };
  } catch (e: any) {
    return {
      error: `An error occurred: ${e.message}`,
    };
  }
}


// AI Support Chat Action

interface Message {
    role: "user" | "assistant";
    content: string;
}

const supportQuerySchema = z.object({
  prompt: z.string().min(1, "Message is required."),
  messages: z.string(), // JSON string of Message[]
});

type SupportState = {
    messages: Message[];
    error?: string;
};

export async function handleSupportQuery(
  prevState: SupportState,
  formData: FormData
): Promise<SupportState> {
  const validatedFields = supportQuerySchema.safeParse({
    prompt: formData.get("prompt"),
    messages: formData.get("messages"),
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      error: "Invalid input. Please enter a message.",
    };
  }
  
  const currentMessages: Message[] = JSON.parse(validatedFields.data.messages);
  const newMessage: Message = { role: "user", content: validatedFields.data.prompt };
  const updatedMessages = [...currentMessages, newMessage];

  try {
    const input: SupportQuestionInput = { messages: updatedMessages };
    const result = await answerSupportQuestion(input);

    const aiResponse: Message = { role: "assistant", content: result.response };
    
    return {
      messages: [...updatedMessages, aiResponse],
    };
  } catch (e: any) {
    return {
      ...prevState,
      messages: updatedMessages,
      error: `An error occurred: ${e.message}`,
    };
  }
}
