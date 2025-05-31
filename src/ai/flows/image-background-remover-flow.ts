
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

// Internal input schema for the Genkit prompt, including the extracted MIME type
const RemoveBackgroundPromptInternalInputSchema = z.object({
  photoDataUri: z.string().describe("The full photo data URI."),
  mimeType: z.string().describe("The MIME type of the photo (e.g., 'image/png').")
});

const RemoveBackgroundOutputSchema = z.object({
  processedPhotoDataUri: z.string().describe('The processed photo as a data URI with the background removed/replaced by a plain one.'),
});
export type RemoveBackgroundOutput = z.infer<typeof RemoveBackgroundOutputSchema>;

export async function removeBackground(input: RemoveBackgroundInput): Promise<RemoveBackgroundOutput> {
  return removeBackgroundFlow(input);
}

const removeBackgroundGenkitPrompt = ai.definePrompt({
  name: 'removeBackgroundPrompt',
  input: {schema: RemoveBackgroundPromptInternalInputSchema},
  output: {schema: RemoveBackgroundOutputSchema},
  model: 'googleai/gemini-2.0-flash-exp', 
  prompt: [
    {media: {url: '{{{photoDataUri}}}', contentType: '{{{mimeType}}}' }},
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
    // Parse the data URI to extract the MIME type
    const mimeTypeMatch = input.photoDataUri.match(/^data:(image\/[^;]+);base64,/);
    if (!mimeTypeMatch || !mimeTypeMatch[1]) {
      console.error('Invalid data URI format or could not extract MIME type from:', input.photoDataUri);
      throw new Error('Invalid data URI format or could not extract MIME type.');
    }
    const mimeType = mimeTypeMatch[1];

    const llmResponse = await removeBackgroundGenkitPrompt({
      photoDataUri: input.photoDataUri,
      mimeType: mimeType,
    });
    
    const output = llmResponse.output;

    if (llmResponse.media?.url) {
      return { processedPhotoDataUri: llmResponse.media.url };
    }
    
    if (output?.processedPhotoDataUri) {
        return { processedPhotoDataUri: output.processedPhotoDataUri };
    }

    console.error('Background removal failed. AI did not return a processed image in media.url or output.processedPhotoDataUri.', llmResponse);
    throw new Error('AI did not return a processed image.');
  }
);
