'use server';

/**
 * @fileOverview Generates QR codes for secure document sharing with OTP or password protection.
 *
 * - generateSecureQRCode - A function that generates a QR code with added security measures.
 * - SecureQRCodeInput - The input type for the generateSecureQRCode function.
 * - SecureQRCodeOutput - The return type for the generateSecureQRCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SecureQRCodeInputSchema = z.object({
  documentId: z.string().describe('The ID of the document to be shared.'),
  securityType: z.enum(['otp', 'password']).describe('The type of security to apply to the QR code.'),
  otp: z.string().optional().describe('The OTP to be used for QR code access, required if securityType is otp.'),
  password: z.string().optional().describe('The password to be used for QR code access, required if securityType is password.'),
});

export type SecureQRCodeInput = z.infer<typeof SecureQRCodeInputSchema>;

const SecureQRCodeOutputSchema = z.object({
  qrCodeDataUri: z.string().describe('The data URI of the generated QR code image.'),
  accessDetails: z.string().describe('Details required to access the document, such as OTP instructions or password hint.'),
});

export type SecureQRCodeOutput = z.infer<typeof SecureQRCodeOutputSchema>;

export async function generateSecureQRCode(input: SecureQRCodeInput): Promise<SecureQRCodeOutput> {
  return secureQRCodeFlow(input);
}

const secureQRCodePrompt = ai.definePrompt({
  name: 'secureQRCodePrompt',
  input: {
    schema: SecureQRCodeInputSchema,
  },
  output: {
    schema: SecureQRCodeOutputSchema,
  },
  prompt: `You are a security expert generating QR codes for document access.

  Based on the provided document ID and security type (OTP or password), generate a QR code that securely links to the document.

  If the security type is OTP, generate a random OTP and embed it in the QR code. Provide instructions to the user on how to use the OTP to access the document.
  If the security type is password, ensure the password meets complexity requirements and provide a hint (if possible) to the user.

  Document ID: {{{documentId}}}
  Security Type: {{{securityType}}}
  OTP (if applicable): {{{otp}}}
  Password (if applicable): {{{password}}}

  Ensure the output includes both the QR code data URI and the necessary access details (OTP or password hint). Focus on delivering secure access mechanism and generate valid QR code.
  `,
});

import QRCode from 'qrcode';

const secureQRCodeFlow = ai.defineFlow(
  {
    name: 'secureQRCodeFlow',
    inputSchema: SecureQRCodeInputSchema,
    outputSchema: SecureQRCodeOutputSchema,
  },
  async input => {
    // Validate OTP/Password based on security type
    if (input.securityType === 'otp' && !input.otp) {
      throw new Error('OTP is required when securityType is otp.');
    }
    if (input.securityType === 'password' && !input.password) {
      throw new Error('Password is required when securityType is password.');
    }

    // Generate QR code data URI
    const qrCodeText = JSON.stringify({
      documentId: input.documentId,
      securityType: input.securityType,
      otp: input.otp,
      password: input.password,
    });

    const qrCodeDataUri = await QRCode.toDataURL(qrCodeText);

     const accessDetails = `Use the following details to access the document. Security Type: ${input.securityType}, ${input.securityType === 'otp' ? `OTP: ${input.otp}` : `Password Hint: Ensure it is a strong password`}`

    // Return the QR code data URI and access details
    return {
      qrCodeDataUri: qrCodeDataUri,
      accessDetails: accessDetails,
    };
  }
);
