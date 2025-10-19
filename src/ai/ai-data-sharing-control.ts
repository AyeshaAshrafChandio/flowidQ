'use server';

/**
 * @fileOverview This file defines a Genkit flow for AI-assisted data sharing control.
 *
 * It allows users to get AI suggestions on what data to share with organizations.
 * - getDataSharingSuggestions - A function that provides suggestions on what data to share.
 * - DataSharingInput - The input type for the getDataSharingSuggestions function.
 * - DataSharingOutput - The return type for the getDataSharingSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DataSharingInputSchema = z.object({
  organizationDescription: z
    .string()
    .describe('The description of the organization requesting data.'),
  userProfileData: z
    .string()
    .describe('The user profile data including name, CNIC, phone, etc.'),
  requestedDocumentList: z
    .array(z.string())
    .describe('A list of documents requested by the organization.'),
});
export type DataSharingInput = z.infer<typeof DataSharingInputSchema>;

const DataSharingOutputSchema = z.object({
  suggestedDataToShare: z
    .array(z.string())
    .describe('A list of suggested data points to share with the organization.'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind the suggested data sharing options.'),
});
export type DataSharingOutput = z.infer<typeof DataSharingOutputSchema>;

export async function getDataSharingSuggestions(
  input: DataSharingInput
): Promise<DataSharingOutput> {
  return dataSharingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dataSharingPrompt',
  input: {schema: DataSharingInputSchema},
  output: {schema: DataSharingOutputSchema},
  prompt: `You are an AI assistant helping users decide what personal data to share with organizations.

  Given the following information about the organization requesting data:
  Organization Description: {{{organizationDescription}}}

  And the following user profile data:
  User Profile Data: {{{userProfileData}}}

  And the following list of requested documents:
  Requested Documents: {{#each requestedDocumentList}}{{{this}}}\n{{/each}}

  Provide a list of suggested data points to share with the organization, and explain your reasoning.

  The output should be a JSON object conforming to DataSharingOutputSchema.
  `,
});

const dataSharingFlow = ai.defineFlow(
  {
    name: 'dataSharingFlow',
    inputSchema: DataSharingInputSchema,
    outputSchema: DataSharingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
