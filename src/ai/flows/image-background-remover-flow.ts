
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

// Public input schema for the flow
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

const removeBackgroundGenkitPrompt = ai.definePrompt({
  name: 'removeBackgroundPrompt',
  input: {schema: RemoveBackgroundInputSchema}, // Use the public input schema directly
  output: {schema: RemoveBackgroundOutputSchema},
  model: 'googleai/gemini-2.0-flash-exp', 
  prompt: [
    // The model should parse the MIME type from the full data URI in 'photoDataUri'
    {media: {url: '{{{photoDataUri}}}' }}, 
    {text: 'Isolate the main subject of this image. Remove the original background and replace it with a plain white background. Provide only the modified image.'},
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


const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: RemoveBackgroundInputSchema, 
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async (input: RemoveBackgroundInput) => {
    // Pass the input directly to the prompt, as photoDataUri is already in the expected format.
    const llmResponse = await removeBackgroundGenkitPrompt(input);
    
    const output = llmResponse.output;

    // Prioritize llmResponse.media.url for image generation/manipulation tasks
    if (llmResponse.media?.url) {
      return { processedPhotoDataUri: llmResponse.media.url };
    }
    
    // Fallback if the image URL is in the structured output for some reason
    if (output?.processedPhotoDataUri) {
        return { processedPhotoDataUri: output.processedPhotoDataUri };
    }

    console.error('Background removal failed. AI did not return a processed image in media.url or output.processedPhotoDataUri.', llmResponse);
    throw new Error('AI did not return a processed image.');
  }
);
