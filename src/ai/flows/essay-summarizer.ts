'use server';

/**
 * @fileOverview An AI agent that summarizes essays.
 *
 * - summarizeEssay - A function that handles the essay summarization process.
 * - SummarizeEssayInput - The input type for the summarizeEssay function.
 * - SummarizeEssayOutput - The return type for the summarizeEssay function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeEssayInputSchema = z.object({
  essay: z.string().describe('The essay to summarize.'),
});
export type SummarizeEssayInput = z.infer<typeof SummarizeEssayInputSchema>;

const SummarizeEssayOutputSchema = z.object({
  summary: z.string().describe('The summary of the essay.'),
});
export type SummarizeEssayOutput = z.infer<typeof SummarizeEssayOutputSchema>;

export async function summarizeEssay(input: SummarizeEssayInput): Promise<SummarizeEssayOutput> {
  return summarizeEssayFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeEssayPrompt',
  input: {schema: SummarizeEssayInputSchema},
  output: {schema: SummarizeEssayOutputSchema},
  prompt: `Summarize the following essay in a concise manner:\n\n{{{essay}}}`,
});

const summarizeEssayFlow = ai.defineFlow(
  {
    name: 'summarizeEssayFlow',
    inputSchema: SummarizeEssayInputSchema,
    outputSchema: SummarizeEssayOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
