
// Cache buster: Updated 2024-07-16 10:30:00 UTC
import type { LucideIcon } from 'lucide-react';
// Icon components are no longer directly used here for type Tool,
// but individual page fallbacks might still import them.

export type ToolCategory = 'Image' | 'Document & Data' | 'Text & AI' | 'Media' | 'Converter' | 'Utilities';

export interface Tool {
  id: string;
  title: string;
  description: string;
  href: string;
  category: ToolCategory;
  iconName: string; // Changed from icon: LucideIcon
  aiPowered?: boolean;
  tags?: string[];
}

export const toolCategories: ToolCategory[] = ['Image', 'Document & Data', 'Text & AI', 'Media', 'Converter', 'Utilities'];

export const tools: Tool[] = [
  // GenAI Tools
  {
    id: 'essay-summarizer',
    title: 'Essay Summarizer',
    description: 'AI-powered essay summarization. Get concise summaries of long texts.',
    href: '/tools/essay-summarizer',
    category: 'Text & AI',
    iconName: 'Wand2',
    aiPowered: true,
    tags: ['ai', 'text', 'summary'],
  },
  {
    id: 'language-translator',
    title: 'Language Translator',
    description: 'Translate text between various languages using AI.',
    href: '/tools/language-translator',
    category: 'Text & AI',
    iconName: 'Languages',
    aiPowered: true,
    tags: ['ai', 'text', 'translation'],
  },
  {
    id: 'book-summary-creator',
    title: 'Book Summary Creator',
    description: 'AI-powered tool to summarize large texts or .txt files. Generates summaries of varying lengths and detail, and extracts key points.',
    href: '/tools/book-summary-creator',
    category: 'Text & AI',
    iconName: 'BookText',
    aiPowered: true,
    tags: ['summary', 'text', 'books', 'ai', 'reader', 'summarize'],
  },
  // Image Tools
  {
    id: 'image-compressor',
    title: 'Image Compressor',
    description: 'Reduce image file sizes while maintaining quality.',
    href: '/tools/image-compressor',
    category: 'Image',
    iconName: 'Scissors',
    tags: ['image', 'compression', 'optimizer'],
  },
  {
    id: 'image-resizer',
    title: 'Image Resizer',
    description: 'Resize images to custom dimensions or predefined sizes.',
    href: '/tools/image-resizer',
    category: 'Image',
    iconName: 'SlidersHorizontal',
    tags: ['image', 'resize', 'dimensions'],
  },
  {
    id: 'image-background-remover',
    title: 'AI Background Remover',
    description: 'Automatically remove backgrounds from images using AI. Replaces background with white.',
    href: '/tools/image-background-remover',
    category: 'Image',
    iconName: 'Wand2', // Example, assuming Wand2 is appropriate
    aiPowered: true,
    tags: ['image', 'background', 'remove', 'ai', 'edit'],
  },
  {
    id: 'image-to-text',
    title: 'Image to Text (OCR)',
    description: 'Extract text from images using Optical Character Recognition.',
    href: '/tools/image-to-text',
    category: 'Image',
    iconName: 'TextSearch',
    aiPowered: true,
    tags: ['image', 'text', 'ocr', 'extract'],
  },
  {
    id: 'image-to-ico',
    title: 'Image to Icon (ICO) Converter',
    description: 'Convert images to a standard icon size (PNG format) downloadable as a .ico file.',
    href: '/tools/image-to-ico',
    category: 'Image',
    iconName: 'BoxSelect',
    tags: ['image', 'icon', 'ico', 'converter'],
  },
   {
    id: 'photo-to-passport-size',
    title: 'Photo to Passport Size Generator',
    description: 'Auto-crop, resize, and align photos to official passport sizes for various countries. Background is white.',
    href: '/tools/photo-to-passport-size',
    category: 'Image',
    iconName: 'Camera',
    tags: ['photo', 'passport', 'id', 'resize', 'crop', 'official'],
  },
  // Document & Data Tools
  {
    id: 'text-to-pdf',
    title: 'Text to PDF Converter',
    description: 'Convert plain text into a downloadable PDF document.',
    href: '/tools/text-to-pdf',
    category: 'Document & Data',
    iconName: 'FileText',
    tags: ['text', 'pdf', 'converter', 'document'],
  },
  {
    id: 'json-to-csv',
    title: 'JSON to CSV Converter',
    description: 'Convert JSON data format to CSV. Handles nested objects and denormalizes arrays of objects.',
    href: '/tools/json-to-csv',
    category: 'Document & Data',
    iconName: 'FileJson',
    tags: ['json', 'csv', 'converter', 'data', 'denormalize'],
  },
  {
    id: 'csv-to-json',
    title: 'CSV to JSON Converter',
    description: 'Convert CSV data format to JSON.',
    href: '/tools/csv-to-json',
    category: 'Document & Data',
    iconName: 'Database',
    tags: ['csv', 'json', 'converter', 'data'],
  },
  {
    id: 'image-to-pdf',
    title: 'Image to PDF Converter',
    description: 'Combine multiple images (JPG, PNG) into a single PDF document.',
    href: '/tools/image-to-pdf',
    category: 'Document & Data',
    iconName: 'Combine',
    tags: ['image', 'pdf', 'converter', 'document', 'merge'],
  },
   {
    id: 'pdf-to-image',
    title: 'PDF to Image Converter',
    description: 'Convert each page of a PDF document into individual image files (PNG).',
    href: '/tools/pdf-to-image',
    category: 'Document & Data',
    iconName: 'FileDown', // Was FileOutput, changed to FileDown for variety
    tags: ['pdf', 'image', 'converter', 'extract', 'pages'],
  },
  // Text & AI Tools (continued)
   {
    id: 'ascii-to-text',
    title: 'ASCII to Text',
    description: 'Convert ASCII encoded text to human-readable text.',
    href: '/tools/ascii-to-text',
    category: 'Text & AI',
    iconName: 'Type',
    tags: ['ascii', 'text', 'decoder'],
  },
  {
    id: 'text-to-handwriting',
    title: 'Text to Handwriting Converter',
    description: 'Convert typed text into a handwriting-style image using various fonts.',
    href: '/tools/text-to-handwriting',
    category: 'Text & AI',
    iconName: 'Edit3',
    tags: ['text', 'handwriting', 'image', 'font', 'style'],
  },
  {
    id: 'voice-notes-to-text',
    title: 'Voice Notes to Organized Text',
    description: 'Transcribe voice notes and format them with smart headings and bullet points using AI.',
    href: '/tools/voice-notes-to-text',
    category: 'Text & AI',
    iconName: 'ListVideo',
    aiPowered: true,
    tags: ['voice', 'audio', 'transcribe', 'notes', 'ai', 'format'],
  },
  // Media Tools
  {
    id: 'video-compressor',
    title: 'Video Compressor',
    description: 'Client-side video re-encoding to help reduce file size, primarily by scaling resolution. Audio preservation depends on browser support.',
    href: '/tools/video-compressor',
    category: 'Media',
    iconName: 'FileVideo',
    tags: ['video', 'compression', 'reduce size', 're-encode', 'client-side'],
  },
  {
    id: 'video-to-gif',
    title: 'Video to GIF Converter',
    description: 'Convert video clips into animated GIFs.',
    href: '/tools/video-to-gif',
    category: 'Media',
    iconName: 'Film',
    tags: ['video', 'gif', 'converter', 'animation'],
  },
  {
    id: 'audio-to-text',
    title: 'Audio to Text',
    description: 'Transcribe speech from audio files into text.',
    href: '/tools/audio-to-text',
    category: 'Media',
    iconName: 'AudioLines',
    aiPowered: true,
    tags: ['audio', 'speech', 'text', 'transcription', 'ai'],
  },
  // Converters (General & Cross-Category)
  {
    id: 'webp-to-jpg',
    title: 'WebP to JPG',
    description: 'Convert WebP images to JPG format.',
    href: '/tools/webp-to-jpg',
    category: 'Converter',
    iconName: 'FileType2',
    tags: ['webp', 'jpg', 'image', 'converter'],
  },
  {
    id: 'jpg-to-webp',
    title: 'JPG to WebP Converter',
    description: 'Convert JPG images to the modern WebP format.',
    href: '/tools/jpg-to-webp',
    category: 'Converter',
    iconName: 'Replace',
    tags: ['jpg', 'jpeg', 'webp', 'image', 'converter'],
  },
  {
    id: 'png-to-jpg',
    title: 'PNG to JPG',
    description: 'Convert PNG images to JPG format.',
    href: '/tools/png-to-jpg',
    category: 'Converter',
    iconName: 'Replace',
    tags: ['png', 'jpg', 'image', 'converter'],
  },
  {
    id: 'jpg-to-png',
    title: 'JPG to PNG Converter',
    description: 'Convert JPG images to PNG format.',
    href: '/tools/jpg-to-png',
    category: 'Converter',
    iconName: 'FileType2',
    tags: ['jpg', 'jpeg', 'png', 'image', 'converter'],
  },
  {
    id: 'svg-to-png',
    title: 'SVG to PNG',
    description: 'Convert SVG vector graphics to PNG images.',
    href: '/tools/svg-to-png',
    category: 'Converter',
    iconName: 'Palette',
    tags: ['svg', 'png', 'image', 'converter', 'vector'],
  },
  {
    id: 'png-to-svg',
    title: 'PNG to SVG Converter (Conceptual)',
    description: 'Conceptual tool to convert PNG images to SVG vector format by embedding the PNG. True vectorization is complex.',
    href: '/tools/png-to-svg',
    category: 'Converter',
    iconName: 'Palette',
    tags: ['png', 'svg', 'image', 'converter', 'vector', 'conceptual'],
  },
  {
    id: 'pdf-word-converter',
    title: 'PDF <=> Word Converter',
    description: 'Convert PDF files to Word documents (.docx) and vice-versa. Client-side conversion with some formatting limitations.',
    href: '/tools/pdf-word-converter',
    category: 'Converter',
    iconName: 'ArrowRightLeft',
    tags: ['pdf', 'word', 'docx', 'converter', 'document'],
  },
  {
    id: 'excel-pdf-converter',
    title: 'Excel <=> PDF Converter',
    description: 'Convert Excel spreadsheets (.xlsx) to PDF files and vice-versa. Client-side conversion with some formatting limitations.',
    href: '/tools/excel-pdf-converter',
    category: 'Converter',
    iconName: 'ArrowRightLeft',
    tags: ['excel', 'xlsx', 'pdf', 'converter', 'document'],
  },
  {
    id: 'powerpoint-pdf-converter',
    title: 'PowerPoint <=> PDF Converter',
    description: 'Convert PowerPoint (.pptx) to PDF and PDF to PowerPoint (pages as images). Client-side with limitations.',
    href: '/tools/powerpoint-pdf-converter',
    category: 'Converter',
    iconName: 'ArrowRightLeft',
    tags: ['powerpoint', 'pptx', 'pdf', 'converter', 'presentation'],
  },
  // Utilities
  {
    id: 'unit-converter',
    title: 'Unit Converter (All-in-One)',
    description: 'Converts length, weight, time, temperature, area, volume, currency, speed, pressure, and more.',
    href: '/tools/unit-converter',
    category: 'Utilities',
    iconName: 'Cog',
    tags: ['units', 'measurement', 'conversion', 'length', 'weight', 'temperature', 'currency'],
  },
  {
    id: 'advanced-calculator',
    title: 'Advanced Calculator & Unit Converter',
    description: 'Combines a smart calculator (scientific, percentage, GST, EMI) with a unit converter (length, weight, temperature, currency, etc.).',
    href: '/tools/advanced-calculator',
    category: 'Utilities',
    iconName: 'Calculator',
    tags: ['calculator', 'scientific', 'gst', 'emi', 'finance', 'math', 'unit converter'],
  },
  {
    id: 'password-generator',
    title: 'Password Generator',
    description: 'Generate strong, customizable passwords with length, character sets, pronounceable options, and strength meter. Save passwords locally.',
    href: '/tools/password-generator',
    category: 'Utilities',
    iconName: 'KeyRound',
    tags: ['password', 'security', 'generator', 'secure', 'customizable'],
  },
  {
    id: 'password-strength-checker',
    title: 'Password Strength Checker',
    description: 'Analyze password strength in real-time. Checks length, variety, common patterns, and estimates crack time. Batch checking available.',
    href: '/tools/password-strength-checker',
    category: 'Utilities',
    iconName: 'ShieldCheck',
    tags: ['password', 'security', 'checker', 'strength', 'analyzer'],
  },
];

export const featuredTools: Tool[] = tools.filter(tool => ['unit-converter', 'photo-to-passport-size', 'voice-notes-to-text', 'advanced-calculator', 'essay-summarizer', 'image-compressor'].includes(tool.id)).slice(0, 6);

export const getToolById = (id: string): Tool | undefined => tools.find(tool => tool.id === id);

export const getToolsByCategory = (category: ToolCategory): Tool[] => tools.filter(tool => tool.category === category);

    