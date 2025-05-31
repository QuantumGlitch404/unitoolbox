
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

// Note: True transparency is hard with generative models.
// This prompt aims to isolate the subject on a plain background.
const removeBackgroundGenkitPrompt = ai.definePrompt({
  name: 'removeBackgroundPrompt',
  input: {schema: RemoveBackgroundInputSchema},
  output: {schema: RemoveBackgroundOutputSchema},
  model: 'googleai/gemini-2.0-flash-exp', // Specify experimental model for image generation capabilities
  prompt: [
    {media: {url: '{{{photoDataUri}}}' }},
    {text: 'Isolate the main subject of this image. Remove the original background and replace it with a plain white background. Provide only the modified image.'},
  ],
  config: {
    responseModalities: ['TEXT', 'IMAGE'], // Must request IMAGE for image output
    safetySettings: [ // Loosen safety settings slightly if needed for diverse images, but be mindful
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
});


const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: RemoveBackgroundInputSchema,
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async (input: RemoveBackgroundInput) => {
    const llmResponse = await removeBackgroundGenkitPrompt(input);
    const output = llmResponse.output;

    if (!output?.processedPhotoDataUri && llmResponse.media?.url) {
      // The model might directly return the image in media.url if the output schema isn't perfectly matched by the text part.
      return { processedPhotoDataUri: llmResponse.media.url };
    }
    if (!output?.processedPhotoDataUri) {
        // Fallback or error if no image URL is found
        console.error('Background removal failed to produce an image URL.', llmResponse);
        // Attempt to extract from media if available
        if (llmResponse.media?.url) {
            return { processedPhotoDataUri: llmResponse.media.url };
        }
        throw new Error('AI did not return a processed image.');
    }
    return output;
  }
);
