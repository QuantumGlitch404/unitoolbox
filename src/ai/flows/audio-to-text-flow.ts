
'use server';
/**
 * @fileOverview An AI agent for transcribing audio files to text.
 *
 * - transcribeAudio - A function that handles the audio transcription process.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio file encoded as a data URI, including MIME type and Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  transcribedText: z.string().describe('The text transcribed from the audio.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return audioTranscriptionFlow(input);
}

// Using ai.generate() directly for more control over the prompt structure with media.
const audioTranscriptionFlow = ai.defineFlow(
  {
    name: 'audioTranscriptionFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async (input: TranscribeAudioInput) => {
    // The Gemini model generally expects the full data URI in the `url` field for media.
    // The MIME type is part of this URI.
    
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash', // Or another suitable Gemini model that supports audio
      prompt: [
        { media: { url: input.audioDataUri } },
        { text: 'Transcribe the speech in this audio file accurately. Include punctuation.' },
      ],
      config: {
        // No specific responseModalities needed if we expect only text output.
        // Add safety settings if necessary
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ],
      },
    });

    const transcribedText = llmResponse.text;
    
    if (transcribedText) {
      return { transcribedText };
    }

    // Fallback or error handling
    const structuredOutput = llmResponse.output as TranscribeAudioOutput | undefined;
    if (structuredOutput?.transcribedText) {
      return { transcribedText: structuredOutput.transcribedText };
    }
    
    console.error('Audio transcription failed. AI did not return text.', { response: llmResponse });
    throw new Error('AI did not return transcribed text.');
  }
);
