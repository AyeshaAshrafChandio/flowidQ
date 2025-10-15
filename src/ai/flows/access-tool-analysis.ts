'use server';

/**
 * @fileOverview Implements an AI tool that assesses access history to enhance security protocols for document sharing.
 *
 * - accessToolAnalysis - An async function that analyzes access history and identifies potential security threats.
 * - AccessToolAnalysisInput - The input type for the accessToolAnalysis function.
 * - AccessToolAnalysisOutput - The return type for the accessToolAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AccessToolAnalysisInputSchema = z.object({
  accessLogs: z
    .string()
    .describe('A string containing the access logs to be analyzed.'),
});
export type AccessToolAnalysisInput = z.infer<typeof AccessToolAnalysisInputSchema>;

const AccessToolAnalysisOutputSchema = z.object({
  analysisResult: z
    .string()
    .describe(
      'An analysis of the access logs, identifying potential security threats and providing recommendations.'
    ),
});
export type AccessToolAnalysisOutput = z.infer<typeof AccessToolAnalysisOutputSchema>;

export async function accessToolAnalysis(
  input: AccessToolAnalysisInput
): Promise<AccessToolAnalysisOutput> {
  return accessToolAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'accessToolAnalysisPrompt',
  input: {schema: AccessToolAnalysisInputSchema},
  output: {schema: AccessToolAnalysisOutputSchema},
  prompt: `You are a security expert analyzing access logs to identify potential security threats related to document sharing.

Analyze the following access logs and provide a detailed analysis, highlighting any anomalies, suspicious activities, or vulnerabilities.

Access Logs:
{{{accessLogs}}}

Based on your analysis, provide recommendations to enhance security protocols and mitigate identified threats.

Ensure that the analysis result is clear, concise, and actionable for security administrators.
`,
});

const accessToolAnalysisFlow = ai.defineFlow(
  {
    name: 'accessToolAnalysisFlow',
    inputSchema: AccessToolAnalysisInputSchema,
    outputSchema: AccessToolAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
