
'use server';
/**
 * @fileOverview An AI agent for extracting text from images (OCR).
 *
 * - extractTextFromImage - A function that handles the image-to-text extraction process.
 * - ImageToTextInput - The input type for the extractTextFromImage function.
 * - ImageToTextOutput - The return type for the extractTextFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageToTextInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "An image containing text, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageToTextInput = z.infer<typeof ImageToTextInputSchema>;

const ImageToTextOutputSchema = z.object({
  extractedText: z.string().describe('The text extracted from the image.'),
});
export type ImageToTextOutput = z.infer<typeof ImageToTextOutputSchema>;

export async function extractTextFromImage(input: ImageToTextInput): Promise<ImageToTextOutput> {
  return ocrFlow(input);
}

const ocrPrompt = ai.definePrompt({
  name: 'ocrPrompt',
  input: {schema: ImageToTextInputSchema},
  output: {schema: ImageToTextOutputSchema},
  prompt: `Perform Optical Character Recognition (OCR) on the following image and return all extracted text.
Focus on accuracy and try to maintain the original structure or line breaks if apparent.

Image:
{{media url=photoDataUri}}

Extracted Text:`,
});

const ocrFlow = ai.defineFlow(
  {
    name: 'ocrFlow',
    inputSchema: ImageToTextInputSchema,
    outputSchema: ImageToTextOutputSchema,
  },
  async (input: ImageToTextInput) => {
    const {output} = await ocrPrompt(input);
    return {
        extractedText: output?.extractedText ?? "No text could be extracted or an error occurred.",
    };
  }
);
