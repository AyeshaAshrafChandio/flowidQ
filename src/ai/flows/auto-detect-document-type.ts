'use server';

/**
 * @fileOverview Automatically detects the type of an uploaded document using AI.
 *
 * - detectDocumentType - A function that handles the document type detection process.
 * - DetectDocumentTypeInput - The input type for the detectDocumentType function.
 * - DetectDocumentTypeOutput - The return type for the detectDocumentType function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectDocumentTypeInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      'A data URI of the document image, including MIME type and Base64 encoding (e.g., data:image/jpeg;base64,...).'
    ),
});
export type DetectDocumentTypeInput = z.infer<typeof DetectDocumentTypeInputSchema>;

const DetectDocumentTypeOutputSchema = z.object({
  documentType: z
    .string()
    .describe('The detected type of the document (e.g., CNIC, Driver\'s License).'),
  confidence: z.number().describe('The confidence level of the document type detection (0-1).'),
});
export type DetectDocumentTypeOutput = z.infer<typeof DetectDocumentTypeOutputSchema>;

export async function detectDocumentType(
  input: DetectDocumentTypeInput
): Promise<DetectDocumentTypeOutput> {
  return detectDocumentTypeFlow(input);
}

const detectDocumentTypePrompt = ai.definePrompt({
  name: 'detectDocumentTypePrompt',
  input: {schema: DetectDocumentTypeInputSchema},
  output: {schema: DetectDocumentTypeOutputSchema},
  prompt: `You are an AI assistant that analyzes a document image and determines its type.

  Analyze the following document and identify its type.  Also, provide a confidence level (0-1) that reflects the certainty of your assessment.

  Document: {{media url=documentDataUri}}
  \n\n  Ensure that the output can be parsed as valid JSON.`,
});

const detectDocumentTypeFlow = ai.defineFlow(
  {
    name: 'detectDocumentTypeFlow',
    inputSchema: DetectDocumentTypeInputSchema,
    outputSchema: DetectDocumentTypeOutputSchema,
  },
  async input => {
    const {output} = await detectDocumentTypePrompt(input);
    return output!;
  }
);
