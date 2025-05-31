
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

// Internal input schema for the Genkit prompt, separating base64 data and mimeType
const RemoveBackgroundPromptInternalInputSchema = z.object({
  base64Data: z
    .string()
    .describe("The Base64 encoded data of the photo, without the 'data:mimetype;base64,' prefix."),
  mimeType: z.string().describe('The MIME type of the photo (e.g., image/png).'),
});

export async function removeBackground(input: RemoveBackgroundInput): Promise<RemoveBackgroundOutput> {
  return removeBackgroundFlow(input);
}

const removeBackgroundGenkitPrompt = ai.definePrompt({
  name: 'removeBackgroundPrompt',
  input: {schema: RemoveBackgroundPromptInternalInputSchema}, // Use the internal schema
  output: {schema: RemoveBackgroundOutputSchema},
  model: 'googleai/gemini-2.0-flash-exp',
  prompt: [
    // The model needs both the data URI (as base64Data here) for the url and the explicit contentType
    {media: {url: '{{{base64Data}}}', contentType: '{{{mimeType}}}'}},
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
    inputSchema: RemoveBackgroundInputSchema, // Public flow still uses the simple input
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async (input: RemoveBackgroundInput) => {
    const dataUri = input.photoDataUri;
    
    const mimeTypeMatch = dataUri.match(/^data:(image\/\w+);base64,/);
    if (!mimeTypeMatch || mimeTypeMatch.length < 2) {
      throw new Error('Invalid data URI format or could not extract MIME type.');
    }
    const mimeType = mimeTypeMatch[1]; // e.g., "image/png"
    
    // Extract the base64 data part (everything after "data:<mimetype>;base64,")
    const base64Data = dataUri.substring(mimeTypeMatch[0].length);

    if (!base64Data) {
        throw new Error('Could not extract base64 data from URI.');
    }

    // Call the prompt with the parsed and structured data
    const llmResponse = await removeBackgroundGenkitPrompt({
      base64Data: base64Data,
      mimeType: mimeType,
    });

    const output = llmResponse.output;

    // Prioritize llmResponse.media.url for image generation/manipulation tasks
    if (llmResponse.media?.url) {
      // The AI model might return base64 data directly in media.url for images.
      // We need to reconstruct the full data URI if it's not already.
      let resultDataUri = llmResponse.media.url;
      if (!resultDataUri.startsWith('data:')) {
        // Assuming the model returns PNG if it doesn't specify, or use original mimeType
        const outputMimeType = llmResponse.media.contentType || 'image/png'; 
        resultDataUri = `data:${outputMimeType};base64,${resultDataUri}`;
      }
      return { processedPhotoDataUri: resultDataUri };
    }

    // Fallback if the image URL is in the structured output for some reason
    if (output?.processedPhotoDataUri) {
        return { processedPhotoDataUri: output.processedPhotoDataUri };
    }

    console.error('Background removal failed. AI did not return a processed image in media.url or output.processedPhotoDataUri.', { response: llmResponse });
    throw new Error('AI did not return a processed image.');
  }
);

