
import type { LucideIcon } from 'lucide-react';
import {
  Scissors, FileText, Languages, Image as ImageIcon, FileJson, Database, AudioLines, Film, Palette, Type, Settings2, Wand2, FileType2, FileUp, FileDown,
  Replace, Rows, Columns, SlidersHorizontal, TextSearch, Link, BoxSelect, Blend, BringToFront, Sparkles, FileVideo, Edit3, Combine, FileCode, ArrowRightLeft,
  Ruler, Weight, Clock, Thermometer, Square, Cuboid, Percent, Calculator, Camera, ListVideo, Cog
} from 'lucide-react';

export type ToolCategory = 'Image' | 'Document & Data' | 'Text & AI' | 'Media' | 'Converter' | 'Utilities';

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

export const toolCategories: ToolCategory[] = ['Image', 'Document & Data', 'Text & AI', 'Media', 'Converter', 'Utilities'];

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
    icon: Wand2,
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
  {
    id: 'image-to-ico',
    title: 'Image to Icon (ICO) Converter',
    description: 'Convert images to a standard icon size (PNG format) downloadable as a .ico file.',
    href: '/tools/image-to-ico',
    category: 'Image',
    icon: BoxSelect,
    tags: ['image', 'icon', 'ico', 'converter'],
  },
   {
    id: 'photo-to-passport-size',
    title: 'Photo to Passport Size Generator',
    description: 'Auto-crop, resize, and align photos to official passport sizes for various countries.',
    href: '/tools/photo-to-passport-size',
    category: 'Image',
    icon: Camera,
    tags: ['photo', 'passport', 'id', 'resize', 'crop', 'official'],
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
    description: 'Convert JSON data format to CSV. Handles nested objects and denormalizes arrays of objects.',
    href: '/tools/json-to-csv',
    category: 'Document & Data',
    icon: FileJson,
    tags: ['json', 'csv', 'converter', 'data', 'denormalize'],
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
    id: 'image-to-pdf',
    title: 'Image to PDF Converter',
    description: 'Combine multiple images (JPG, PNG) into a single PDF document.',
    href: '/tools/image-to-pdf',
    category: 'Document & Data',
    icon: Combine,
    tags: ['image', 'pdf', 'converter', 'document', 'merge'],
  },
   {
    id: 'pdf-to-image',
    title: 'PDF to Image Converter',
    description: 'Convert each page of a PDF document into individual image files (PNG).',
    href: '/tools/pdf-to-image',
    category: 'Document & Data',
    icon: FileDown,
    tags: ['pdf', 'image', 'converter', 'extract', 'pages'],
  },
  // Text & AI Tools (continued)
   {
    id: 'ascii-to-text',
    title: 'ASCII to Text',
    description: 'Convert ASCII encoded text to human-readable text.',
    href: '/tools/ascii-to-text',
    category: 'Text & AI',
    icon: Type,
    tags: ['ascii', 'text', 'decoder'],
  },
  {
    id: 'text-to-handwriting',
    title: 'Text to Handwriting Converter',
    description: 'Convert typed text into a handwriting-style image using various fonts.',
    href: '/tools/text-to-handwriting',
    category: 'Text & AI',
    icon: Edit3,
    tags: ['text', 'handwriting', 'image', 'font', 'style'],
  },
  {
    id: 'voice-notes-to-text',
    title: 'Voice Notes to Organized Text',
    description: 'Transcribe voice notes and format them with smart headings and bullet points using AI.',
    href: '/tools/voice-notes-to-text',
    category: 'Text & AI',
    icon: ListVideo,
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
    icon: FileVideo,
    tags: ['video', 'compression', 'reduce size', 're-encode', 'client-side'],
  },
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
  // Converters (General & Cross-Category)
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
    id: 'jpg-to-webp',
    title: 'JPG to WebP Converter',
    description: 'Convert JPG images to the modern WebP format.',
    href: '/tools/jpg-to-webp',
    category: 'Converter',
    icon: Replace,
    tags: ['jpg', 'jpeg', 'webp', 'image', 'converter'],
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
    id: 'jpg-to-png',
    title: 'JPG to PNG Converter',
    description: 'Convert JPG images to PNG format.',
    href: '/tools/jpg-to-png',
    category: 'Converter',
    icon: FileType2,
    tags: ['jpg', 'jpeg', 'png', 'image', 'converter'],
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
  {
    id: 'png-to-svg',
    title: 'PNG to SVG Converter (Conceptual)',
    description: 'Conceptual tool to convert PNG images to SVG vector format by embedding the PNG. True vectorization is complex.',
    href: '/tools/png-to-svg',
    category: 'Converter',
    icon: Palette,
    tags: ['png', 'svg', 'image', 'converter', 'vector', 'conceptual'],
  },
  {
    id: 'pdf-word-converter',
    title: 'PDF <=> Word Converter',
    description: 'Convert PDF files to Word documents (.docx) and vice-versa. Client-side conversion with some formatting limitations.',
    href: '/tools/pdf-word-converter',
    category: 'Converter',
    icon: ArrowRightLeft,
    tags: ['pdf', 'word', 'docx', 'converter', 'document'],
  },
  {
    id: 'excel-pdf-converter',
    title: 'Excel <=> PDF Converter',
    description: 'Convert Excel spreadsheets (.xlsx) to PDF files and vice-versa. Client-side conversion with some formatting limitations.',
    href: '/tools/excel-pdf-converter',
    category: 'Converter',
    icon: ArrowRightLeft,
    tags: ['excel', 'xlsx', 'pdf', 'converter', 'document'],
  },
  // Utilities
  {
    id: 'unit-converter',
    title: 'Unit Converter (All-in-One)',
    description: 'Converts length, weight, time, temperature, area, volume, currency, speed, pressure, and more.',
    href: '/tools/unit-converter',
    category: 'Utilities',
    icon: Cog,
    tags: ['units', 'measurement', 'conversion', 'length', 'weight', 'temperature', 'currency'],
  },
  {
    id: 'advanced-calculator',
    title: 'Advanced Calculator & Unit Converter',
    description: 'Combines a smart calculator (scientific, percentage, GST, EMI) with a unit converter (length, weight, temperature, currency, etc.).',
    href: '/tools/advanced-calculator',
    category: 'Utilities',
    icon: Calculator,
    tags: ['calculator', 'scientific', 'gst', 'emi', 'finance', 'math', 'unit converter'],
  },
];

export const featuredTools: Tool[] = tools.filter(tool => ['unit-converter', 'photo-to-passport-size', 'voice-notes-to-text', 'advanced-calculator', 'essay-summarizer'].includes(tool.id)).slice(0, 4);

export const getToolById = (id: string): Tool | undefined => tools.find(tool => tool.id === id);

export const getToolsByCategory = (category: ToolCategory): Tool[] => tools.filter(tool => tool.category === category);
    