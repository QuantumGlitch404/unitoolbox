
'use server';
/**
 * @fileOverview An AI agent for formatting transcribed text.
 *
 * - formatText - A function that handles text formatting.
 * - FormatTextInput - The input type for the formatText function.
 * - FormatTextOutput - The return type for the formatText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormatTextInputSchema = z.object({
  rawText: z.string().describe('The raw transcribed text to be formatted.'),
});
export type FormatTextInput = z.infer<typeof FormatTextInputSchema>;

const FormatTextOutputSchema = z.object({
  formattedText: z.string().describe('The text formatted with headings, paragraphs, and bullet points where appropriate.'),
});
export type FormatTextOutput = z.infer<typeof FormatTextOutputSchema>;

export async function formatText(input: FormatTextInput): Promise<FormatTextOutput> {
  return formatTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'formatTextPrompt',
  input: {schema: FormatTextInputSchema},
  output: {schema: FormatTextOutputSchema},
  prompt: `You are an expert text organizer and editor.
Take the following transcribed text and format it clearly and logically.
Identify main topics and use them as headings (e.g., ## Heading).
Structure related information into paragraphs.
Use bullet points (e.g., * Point 1) for lists or key details where appropriate.
Ensure the output is well-punctuated and easy to read.

Raw Text:
{{{rawText}}}

Formatted Text:`,
  // You might want to adjust safety settings if formatting potentially sensitive content.
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  }
});

const formatTextFlow = ai.defineFlow(
  {
    name: 'formatTextFlow',
    inputSchema: FormatTextInputSchema,
    outputSchema: FormatTextOutputSchema,
  },
  async (input: FormatTextInput) => {
    const {output} = await prompt(input);
    if (output?.formattedText) {
        return { formattedText: output.formattedText };
    }
    // Fallback if structured output isn't perfect but text is there
    // For this prompt, we strongly expect formattedText in output.
    // If the model provides text but not in the 'formattedText' field,
    // we could try to use the general text() response, but it might not be ideal.
    // For now, let's assume the model follows the output schema.
    console.error('AI did not return formatted text as expected.', { output });
    throw new Error('AI did not return formatted text.');
  }
);
