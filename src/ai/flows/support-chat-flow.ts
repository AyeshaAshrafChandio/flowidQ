
'use server';

/**
 * @fileOverview Provides AI-powered support chat for the FlowIDQ application.
 *
 * - answerSupportQuestion - A function that answers user questions about the app.
 * - SupportQuestionInput - The input type for the answerSupportQuestion function.
 * - SupportQuestionOutput - The return type for the answerSupportQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const SupportQuestionInputSchema = z.object({
  messages: z.array(MessageSchema).describe('The history of the conversation.'),
});
export type SupportQuestionInput = z.infer<typeof SupportQuestionInputSchema>;

const SupportQuestionOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response to the user's question."),
});
export type SupportQuestionOutput = z.infer<typeof SupportQuestionOutputSchema>;

export async function answerSupportQuestion(
  input: SupportQuestionInput
): Promise<SupportQuestionOutput> {
  return supportChatFlow(input);
}

const supportChatPrompt = ai.definePrompt({
  name: 'supportChatPrompt',
  input: {schema: SupportQuestionInputSchema},
  output: {schema: SupportQuestionOutputSchema},
  prompt: `You are an expert support agent for a digital document wallet application called "FlowIDQ". Your role is to assist users by answering their questions about the app's features and functionality.

  Your tone should be helpful, friendly, and clear.

  The user can:
  - Upload documents (CNIC, degrees, etc.).
  - Have the AI automatically detect the document type.
  - View and manage their documents.
  - Scan QR codes from organizations to share documents.
  - Generate their own QR codes to share selected documents.
  - Track their position in virtual queues (e.g., at a hospital or bank).
  - Manage their user profile.

  Conversation History:
  {{#each messages}}
  {{role}}: {{{content}}}
  {{/each}}
  assistant:`,
});

const supportChatFlow = ai.defineFlow(
  {
    name: 'supportChatFlow',
    inputSchema: SupportQuestionInputSchema,
    outputSchema: SupportQuestionOutputSchema,
  },
  async input => {
    const {output} = await supportChatPrompt(input);
    return output!;
  }
);
