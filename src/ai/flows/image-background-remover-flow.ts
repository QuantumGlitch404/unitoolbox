
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
    const fullDataUri = input.photoDataUri;
    
    // Call ai.generate directly
    const llmResponse = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // This model supports image generation/manipulation
        prompt: [
            { media: { url: fullDataUri } }, // Pass the full data URI here
            { text: 'Isolate the main subject of this image. Remove the original background and replace it with a plain white background. Provide only the modified image.' },
        ],
        config: {
            responseModalities: ['TEXT', 'IMAGE'], // Important: specify that image output is expected
            safetySettings: [ // Optional: Adjust safety settings if needed
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            ],
        },
    });
    
    // The processed image should be in llmResponse.media.url
    if (llmResponse.media?.url) {
      let resultDataUri = llmResponse.media.url;
      // Ensure the result is a full data URI if it's not already
      if (!resultDataUri.startsWith('data:')) {
        // Attempt to get mime type from response, default to png if not available
        const outputMimeType = llmResponse.media.contentType || 'image/png'; 
        resultDataUri = `data:${outputMimeType};base64,${resultDataUri}`;
      }
      return { processedPhotoDataUri: resultDataUri };
    }

    // Fallback: check if the model put the data URI in the structured output (less common for image generation)
    const structuredOutput = llmResponse.output as RemoveBackgroundOutput | undefined;
    if (structuredOutput?.processedPhotoDataUri) {
        return { processedPhotoDataUri: structuredOutput.processedPhotoDataUri };
    }

    console.error('Background removal failed. AI did not return a processed image in media.url or structured output.', { response: llmResponse });
    throw new Error('AI did not return a processed image.');
  }
);

