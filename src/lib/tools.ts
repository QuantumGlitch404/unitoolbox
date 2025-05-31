
import type { LucideIcon } from 'lucide-react';
import {
  Scissors, FileText, Languages, Image, FileJson, Database, AudioLines, Film, Palette, Type, Settings2, Wand2, FileType2, FileUp, FileDown,
  Replace, Rows, Columns, SlidersHorizontal, TextSearch, Link, BoxSelect, Blend, BringToFront, Sparkles
} from 'lucide-react';

export type ToolCategory = 'Image' | 'Document & Data' | 'Text & AI' | 'Media' | 'Converter';

export interface Tool {
  id: string;
  title: string;
  description: string;
  href: string;
  category: ToolCategory;
  icon: LucideIcon;
  aiPowered?: boolean;
  tags?: string[];
}

export const toolCategories: ToolCategory[] = ['Image', 'Document & Data', 'Text & AI', 'Media', 'Converter'];

export const tools: Tool[] = [
  // GenAI Tools
  {
    id: 'essay-summarizer',
    title: 'Essay Summarizer',
    description: 'AI-powered essay summarization. Get concise summaries of long texts.',
    href: '/tools/essay-summarizer',
    category: 'Text & AI',
    icon: Wand2,
    aiPowered: true,
    tags: ['ai', 'text', 'summary'],
  },
  {
    id: 'language-translator',
    title: 'Language Translator',
    description: 'Translate text between various languages using AI.',
    href: '/tools/language-translator',
    category: 'Text & AI',
    icon: Languages,
    aiPowered: true,
    tags: ['ai', 'text', 'translation'],
  },
  // Image Tools
  {
    id: 'image-compressor',
    title: 'Image Compressor',
    description: 'Reduce image file sizes while maintaining quality.',
    href: '/tools/image-compressor',
    category: 'Image',
    icon: Scissors,
    tags: ['image', 'compression', 'optimizer'],
  },
  {
    id: 'image-resizer',
    title: 'Image Resizer',
    description: 'Resize images to custom dimensions or predefined sizes.',
    href: '/tools/image-resizer',
    category: 'Image',
    icon: SlidersHorizontal,
    tags: ['image', 'resize', 'dimensions'],
  },
  {
    id: 'image-background-remover',
    title: 'AI Background Remover',
    description: 'Automatically remove backgrounds from images using AI. Replaces background with white.',
    href: '/tools/image-background-remover',
    category: 'Image',
    icon: Wand2, // Changed icon to Wand2 to signify AI
    aiPowered: true, 
    tags: ['image', 'background', 'remove', 'ai', 'edit'],
  },
  {
    id: 'image-to-text',
    title: 'Image to Text (OCR)',
    description: 'Extract text from images using Optical Character Recognition.',
    href: '/tools/image-to-text',
    category: 'Image',
    icon: TextSearch,
    aiPowered: true,
    tags: ['image', 'text', 'ocr', 'extract'],
  },
  // Document & Data Tools
  {
    id: 'text-to-pdf',
    title: 'Text to PDF Converter',
    description: 'Convert plain text into a downloadable PDF document.',
    href: '/tools/text-to-pdf',
    category: 'Document & Data',
    icon: FileText,
    tags: ['text', 'pdf', 'converter', 'document'],
  },
  {
    id: 'json-to-csv',
    title: 'JSON to CSV Converter',
    description: 'Convert JSON data format to CSV.',
    href: '/tools/json-to-csv',
    category: 'Document & Data',
    icon: FileJson,
    tags: ['json', 'csv', 'converter', 'data'],
  },
  {
    id: 'csv-to-json',
    title: 'CSV to JSON Converter',
    description: 'Convert CSV data format to JSON.',
    href: '/tools/csv-to-json',
    category: 'Document & Data',
    icon: Database,
    tags: ['csv', 'json', 'converter', 'data'],
  },
   {
    id: 'ascii-to-text',
    title: 'ASCII to Text',
    description: 'Convert ASCII encoded text to human-readable text.',
    href: '/tools/ascii-to-text',
    category: 'Text & AI',
    icon: Type,
    tags: ['ascii', 'text', 'decoder'],
  },
  // Media Tools
  {
    id: 'video-to-gif',
    title: 'Video to GIF Converter',
    description: 'Convert video clips into animated GIFs.',
    href: '/tools/video-to-gif',
    category: 'Media',
    icon: Film,
    tags: ['video', 'gif', 'converter', 'animation'],
  },
  {
    id: 'audio-to-text',
    title: 'Audio to Text',
    description: 'Transcribe speech from audio files into text.',
    href: '/tools/audio-to-text',
    category: 'Media',
    icon: AudioLines,
    aiPowered: true,
    tags: ['audio', 'speech', 'text', 'transcription', 'ai'],
  },
  // Converters (catch-all for many specific format conversions)
  {
    id: 'webp-to-jpg',
    title: 'WebP to JPG',
    description: 'Convert WebP images to JPG format.',
    href: '/tools/webp-to-jpg',
    category: 'Converter',
    icon: FileType2,
    tags: ['webp', 'jpg', 'image', 'converter'],
  },
  {
    id: 'png-to-jpg',
    title: 'PNG to JPG',
    description: 'Convert PNG images to JPG format.',
    href: '/tools/png-to-jpg',
    category: 'Converter',
    icon: Replace,
    tags: ['png', 'jpg', 'image', 'converter'],
  },
  {
    id: 'svg-to-png',
    title: 'SVG to PNG',
    description: 'Convert SVG vector graphics to PNG images.',
    href: '/tools/svg-to-png',
    category: 'Converter',
    icon: Palette,
    tags: ['svg', 'png', 'image', 'converter', 'vector'],
  },
];

export const featuredTools: Tool[] = tools.slice(0, 4); 

export const getToolById = (id: string): Tool | undefined => tools.find(tool => tool.id === id);
