
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

// This remains the public input schema for the flow, exposed to the client.
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

// This is the public function called by the client. Its signature doesn't change.
export async function removeBackground(input: RemoveBackgroundInput): Promise<RemoveBackgroundOutput> {
  return removeBackgroundFlow(input);
}

// Define an internal schema specifically for what the Genkit prompt needs.
const PromptInternalInputSchema = z.object({
  base64Data: z.string().describe("Base64 encoded image data, without the 'data:<mimetype>;base64,' prefix."),
  mimeType: z.string().describe("The MIME type of the image (e.g., image/png, image/jpeg)."),
});

const removeBackgroundGenkitPrompt = ai.definePrompt({
  name: 'removeBackgroundPrompt',
  input: {schema: PromptInternalInputSchema}, // Use the new internal schema
  output: {schema: RemoveBackgroundOutputSchema},
  model: 'googleai/gemini-2.0-flash-exp', // Specify experimental model for image generation capabilities
  prompt: [
    // Use the fields from PromptInternalInputSchema
    {media: {url: '{{{base64Data}}}', contentType: '{{{mimeType}}}' }},
    {text: 'Isolate the main subject of this image. Remove the original background and replace it with a plain white background. Provide only the modified image.'},
  ],
  config: {
    responseModalities: ['TEXT', 'IMAGE'], // Must request IMAGE for image output
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
    inputSchema: RemoveBackgroundInputSchema, // Flow's input schema remains the same
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async (input: RemoveBackgroundInput) => {
    // Parse the incoming photoDataUri to extract base64 data and MIME type
    const uriParts = input.photoDataUri.match(/^data:(.+);base64,(.+)$/);
    if (!uriParts || uriParts.length !== 3) {
      console.error('Invalid data URI format received in removeBackgroundFlow:', input.photoDataUri.substring(0, 100));
      throw new Error('Invalid data URI format. Expected format: data:<mimetype>;base64,<encoded_data>');
    }
    const mimeType = uriParts[1];
    const base64Data = uriParts[2];

    // Call the prompt with the parsed and structured data
    const llmResponse = await removeBackgroundGenkitPrompt({ base64Data, mimeType });
    const output = llmResponse.output;

    if (!output?.processedPhotoDataUri && llmResponse.media?.url) {
      // The model might directly return the image in media.url
      return { processedPhotoDataUri: llmResponse.media.url };
    }
    if (!output?.processedPhotoDataUri) {
        // Fallback or error if no image URL is found
        if (llmResponse.media?.url) {
            return { processedPhotoDataUri: llmResponse.media.url };
        }
        console.error('Background removal failed to produce an image URL from output or media.', llmResponse);
        throw new Error('AI did not return a processed image.');
    }
    return output;
  }
);
