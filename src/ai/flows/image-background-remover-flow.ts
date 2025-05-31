
'use server';
/**
 * @fileOverview An AI agent for removing backgrounds from images.
 *
 * - removeBackground - A function that handles the image background removal process.
 * - RemoveBackgroundInput - The input type for the removeBackground function.
 * - RemoveBackgroundOutput - The return type for the removeBackground function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RemoveBackgroundInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an object or person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RemoveBackgroundInput = z.infer<typeof RemoveBackgroundInputSchema>;

const RemoveBackgroundOutputSchema = z.object({
  processedPhotoDataUri: z.string().describe('The processed photo as a data URI with the background removed/replaced by a plain one.'),
});
export type RemoveBackgroundOutput = z.infer<typeof RemoveBackgroundOutputSchema>;

export async function removeBackground(input: RemoveBackgroundInput): Promise<RemoveBackgroundOutput> {
  return removeBackgroundFlow(input);
}

const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: RemoveBackgroundInputSchema,
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async (input: RemoveBackgroundInput) => {
    const dataUri = input.photoDataUri;
    
    const mimeTypeMatch = dataUri.match(/^data:(image\/\w+);base64,/);
    if (!mimeTypeMatch || mimeTypeMatch.length < 2) {
      throw new Error('Invalid data URI format or could not extract MIME type.');
    }
    const mimeType = mimeTypeMatch[1]; // e.g., "image/png"
    
    const base64Data = dataUri.substring(mimeTypeMatch[0].length);

    if (!base64Data) {
        throw new Error('Could not extract base64 data from URI.');
    }

    // Call ai.generate directly
    const llmResponse = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: [
            { media: { url: base64Data, contentType: mimeType } },
            { text: 'Isolate the main subject of this image. Remove the original background and replace it with a plain white background. Provide only the modified image.' },
        ],
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
            safetySettings: [
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            ],
        },
    });
    
    if (llmResponse.media?.url) {
      let resultDataUri = llmResponse.media.url;
      if (!resultDataUri.startsWith('data:')) {
        const outputMimeType = llmResponse.media.contentType || 'image/png'; 
        resultDataUri = `data:${outputMimeType};base64,${resultDataUri}`;
      }
      return { processedPhotoDataUri: resultDataUri };
    }

    const structuredOutput = llmResponse.output as RemoveBackgroundOutput | undefined;
    if (structuredOutput?.processedPhotoDataUri) {
        return { processedPhotoDataUri: structuredOutput.processedPhotoDataUri };
    }

    console.error('Background removal failed. AI did not return a processed image in media.url or structured output.', { response: llmResponse });
    throw new Error('AI did not return a processed image.');
  }
);
