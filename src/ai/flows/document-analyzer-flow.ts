'use server';
/**
 * @fileOverview An AI agent for analyzing documents.
 *
 * - analyzeDocument - A function that handles the document analysis process.
 * - DocumentAnalyzerInput - The input type for the analyzeDocument function.
 * - DocumentAnalyzerOutput - The return type for the analyzeDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DocumentAnalyzerInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "An image of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DocumentAnalyzerInput = z.infer<typeof DocumentAnalyzerInputSchema>;

const DocumentAnalyzerOutputSchema = z.object({
  documentType: z.string().describe('The type of the document (e.g., Passport, Drivers License, ID Card, etc.).'),
  extractedData: z.record(z.string()).describe('Key-value pairs of information extracted from the document.'),
});
export type DocumentAnalyzerOutput = z.infer<typeof DocumentAnalyzerOutputSchema>;

export async function analyzeDocument(input: DocumentAnalyzerInput): Promise<DocumentAnalyzerOutput> {
  return documentAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'documentAnalyzerPrompt',
  input: {schema: DocumentAnalyzerInputSchema},
  output: {schema: DocumentAnalyzerOutputSchema},
  prompt: `You are an expert document analyst. Your task is to analyze the provided document image and extract key information.
  
  1. Identify the type of document (e.g., Passport, Drivers License, ID Card, Bank Statement, etc.).
  2. Extract all relevant key-value pairs from the document. For example, for a passport, you might extract "Passport Number", "Full Name", "Date of Birth", "Nationality", etc.
  
  Analyze the following document:
  
  Document Image: {{media url=photoDataUri}}`,
});

const documentAnalyzerFlow = ai.defineFlow(
  {
    name: 'documentAnalyzerFlow',
    inputSchema: DocumentAnalyzerInputSchema,
    outputSchema: DocumentAnalyzerOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
