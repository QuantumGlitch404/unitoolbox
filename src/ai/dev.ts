
import { config } from 'dotenv';
config();

import '@/ai/flows/language-translator.ts';
import '@/ai/flows/essay-summarizer.ts';
import '@/ai/flows/image-background-remover-flow.ts';
import '@/ai/flows/image-to-text-flow.ts';
import '@/ai/flows/audio-to-text-flow.ts';
import '@/ai/flows/format-transcribed-text-flow.ts';
