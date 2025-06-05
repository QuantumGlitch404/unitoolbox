
// Cache buster: Updated 2024-07-16 10:30:00 UTC
import type { LucideIcon } from 'lucide-react';

export type ToolCategory = 'Image' | 'Document & Data' | 'Text & AI' | 'Media' | 'Converter' | 'Utilities';

export interface Tool {
  id: string;
  title: string; // SEO-friendly title
  description: string; // Meta description
  href: string;
  category: ToolCategory;
  iconName: string;
  aiPowered?: boolean;
  tags?: string[];
  keywords: string[]; // For meta keywords
  whatItDoes: string; // Explanation of the tool
  benefits: string[]; // Key benefits of using the tool
  // instructions are already part of the page components
}

export const toolCategories: ToolCategory[] = ['Image', 'Document & Data', 'Text & AI', 'Media', 'Converter', 'Utilities'];

export const tools: Tool[] = [
  // --- Text & AI Tools ---
  {
    id: 'essay-summarizer',
    title: 'AI Essay Summarizer | Condense Text Instantly | UniToolBox',
    description: 'Our AI Essay Summarizer quickly condenses long articles, papers, or essays into concise summaries. Understand key points faster and save reading time. Free online tool.',
    href: '/tools/essay-summarizer',
    category: 'Text & AI',
    iconName: 'Wand2',
    aiPowered: true,
    tags: ['ai', 'text', 'summary', 'summarize', 'article summarizer', 'text summarizer', 'abstract'],
    keywords: ['ai essay summarizer', 'text summarizer', 'summarize articles online', 'free summary tool', 'abstract generator', 'text condensation'],
    whatItDoes: 'This AI-powered tool intelligently analyzes your provided text—be it essays, articles, or reports—and extracts the core information to generate a shorter, coherent summary. It helps you grasp the main ideas efficiently without needing to read the entire document.',
    benefits: [
      'Saves significant reading time on lengthy documents.',
      'Quickly understand the main arguments and conclusions.',
      'Improves productivity by focusing on key information.',
      'Ideal for students, researchers, and professionals needing rapid insights.'
    ]
  },
  {
    id: 'language-translator',
    title: 'AI Language Translator | Free Multi-Language Translation | UniToolBox',
    description: 'Translate text accurately between various languages using our advanced AI. Supports English, Spanish, French, German, Japanese, and more. Free and easy to use.',
    href: '/tools/language-translator',
    category: 'Text & AI',
    iconName: 'Languages',
    aiPowered: true,
    tags: ['ai', 'text', 'translation', 'language converter', 'multilingual'],
    keywords: ['language translator', 'ai translation', 'free online translator', 'translate text', 'multilingual tool', 'language conversion'],
    whatItDoes: 'Our AI Language Translator enables you to effortlessly translate text between a wide array of languages. Simply input your text, select the source and target languages, and the AI will provide an accurate translation.',
    benefits: [
      'Break down language barriers in communication and content consumption.',
      'Supports a diverse range of common and less common languages.',
      'Provides quick and generally accurate translations for everyday needs.',
      'Useful for learning new languages or understanding foreign text.'
    ]
  },
  {
    id: 'book-summary-creator',
    title: 'AI Book Summary Creator | Summarize TXT Files & Books | UniToolBox',
    description: 'Upload .txt files or paste large texts to generate AI-powered book summaries. Choose summary length and detail level, with key point extraction. Perfect for readers and researchers.',
    href: '/tools/book-summary-creator',
    category: 'Text & AI',
    iconName: 'BookText',
    aiPowered: true,
    tags: ['summary', 'text', 'books', 'ai', 'reader', 'summarize', 'chapter summary', 'key points'],
    keywords: ['book summary generator', 'ai text summarizer', 'summarize .txt file', 'chapter summarizer', 'key points extractor', 'long text summary'],
    whatItDoes: 'The AI Book Summary Creator processes large blocks of text or uploaded .txt files to produce structured summaries. You can customize the desired length and level of detail. The AI also attempts to identify and list key takeaways and main ideas from the content.',
    benefits: [
      'Efficiently digest long-form content like books or lengthy reports.',
      'Customizable summary output to fit your specific needs.',
      'Extracts and highlights crucial points for better understanding.',
      'Supports direct text input or .txt file uploads for convenience.'
    ]
  },
  {
    id: 'ascii-to-text',
    title: 'ASCII to Text Converter | Decode ASCII Online | UniToolBox',
    description: 'Easily convert ASCII codes (decimal or other representations) into human-readable plain text. Simple, free, and online ASCII decoder.',
    href: '/tools/ascii-to-text',
    category: 'Text & AI',
    iconName: 'Type',
    tags: ['ascii', 'text', 'decoder', 'char code', 'converter'],
    keywords: ['ascii to text', 'ascii decoder', 'convert ascii codes', 'online ascii converter', 'char to text'],
    whatItDoes: 'This tool decodes ASCII (American Standard Code for Information Interchange) representations back into standard text. It can handle common ASCII formats, such as space-separated character codes.',
    benefits: [
      'Quickly convert encoded ASCII messages or data into readable format.',
      'Useful for developers, students, or anyone working with character encodings.',
      'Simple interface for easy decoding.',
      'Supports common numerical ASCII representations.'
    ]
  },
  {
    id: 'text-to-handwriting',
    title: 'Text to Handwriting Image Converter | Online Tool | UniToolBox',
    description: 'Transform your typed text into a realistic handwriting-style image. Choose from various fonts, adjust size and color, and download the result as a PNG.',
    href: '/tools/text-to-handwriting',
    category: 'Text & AI',
    iconName: 'Edit3',
    tags: ['text', 'handwriting', 'image', 'font', 'style', 'generator'],
    keywords: ['text to handwriting', 'handwriting generator', 'handwritten font image', 'online handwriting converter', 'custom text image'],
    whatItDoes: 'This tool converts your digital text into an image that mimics handwriting. You can select different handwriting-style fonts, customize the font size, color, and the dimensions of the output image to create a personalized handwritten effect.',
    benefits: [
      'Create personalized notes, letters, or digital artwork with a handwritten feel.',
      'Choose from a selection of cursive and handwriting fonts.',
      'Customize text appearance (size, color) and image dimensions.',
      'Download the generated handwriting as a PNG image.'
    ]
  },
  {
    id: 'voice-notes-to-text',
    title: 'AI Voice Notes to Formatted Text | Transcribe & Organize | UniToolBox',
    description: 'Upload or record voice notes and let our AI transcribe them into text. The AI then automatically formats the transcription with smart headings and bullet points for clarity.',
    href: '/tools/voice-notes-to-text',
    category: 'Text & AI',
    iconName: 'ListVideo',
    aiPowered: true,
    tags: ['voice', 'audio', 'transcribe', 'notes', 'ai', 'format', 'speech to text', 'organize'],
    keywords: ['voice to text ai', 'transcribe audio notes', 'ai text formatter', 'speech recognition online', 'organize voice memos', 'smart transcription'],
    whatItDoes: 'This tool first transcribes your uploaded audio file or live recording into raw text using AI speech recognition. Then, another AI process analyzes this transcription to structure it logically with appropriate headings, paragraphs, and bullet points, making it easier to read and understand.',
    benefits: [
      'Convert spoken ideas from voice notes into well-organized written text.',
      'Saves time on manual transcription and formatting.',
      'AI-powered formatting improves readability and structure of notes.',
      'Supports both audio file uploads and direct browser recording.'
    ]
  },

  // --- Image Tools ---
  {
    id: 'image-compressor',
    title: 'Image Compressor | Reduce JPG, PNG, WebP File Size | UniToolBox',
    description: 'Optimize your images by reducing their file sizes without significant quality loss. Supports JPG, PNG, WebP, and GIF. Adjust compression level for desired results.',
    href: '/tools/image-compressor',
    category: 'Image',
    iconName: 'Scissors',
    tags: ['image', 'compression', 'optimizer', 'reduce size', 'photo compressor'],
    keywords: ['image compressor', 'reduce image size', 'photo optimizer', 'compress jpg', 'compress png', 'online image compression'],
    whatItDoes: 'Our Image Compressor helps you shrink the file size of your images. This is useful for faster web page loading, easier sharing, and saving storage space. You can typically adjust the compression level to balance size and quality.',
    benefits: [
      'Significantly reduces image file sizes.',
      'Helps improve website loading speed.',
      'Makes images easier to share via email or social media.',
      'Client-side processing for privacy (for basic compression).',
      'Supports common image formats like JPG, PNG, WebP.'
    ]
  },
  {
    id: 'image-resizer',
    title: 'Image Resizer | Resize JPG, PNG, WebP Online Free | UniToolBox',
    description: 'Easily resize your images to custom dimensions (width and height in pixels) or common predefined sizes. Supports JPG, PNG, WebP, GIF. Free and online.',
    href: '/tools/image-resizer',
    category: 'Image',
    iconName: 'SlidersHorizontal',
    tags: ['image', 'resize', 'dimensions', 'photo resizer', 'scale image'],
    keywords: ['image resizer', 'resize photo online', 'change image dimensions', 'online picture resizer', 'scale image free'],
    whatItDoes: 'The Image Resizer allows you to change the dimensions (width and height) of your images. You can specify exact pixel values to fit various requirements, such as social media posts, website banners, or email attachments.',
    benefits: [
      'Adjust image dimensions to specific pixel requirements.',
      'Prepare images for different platforms or uses.',
      'Simple interface for quick resizing tasks.',
      'Supports popular image formats.'
    ]
  },
  {
    id: 'image-background-remover',
    title: 'AI Image Background Remover | Free Online Tool | UniToolBox',
    description: 'Automatically remove the background from your images using AI. Get a clean subject with a plain white background. Supports JPG, PNG, WebP.',
    href: '/tools/image-background-remover',
    category: 'Image',
    iconName: 'Wand2',
    aiPowered: true,
    tags: ['image', 'background', 'remove', 'ai', 'edit', 'cutout', 'transparent'],
    keywords: ['background remover', 'ai image editing', 'remove image background free', 'photo background eraser', 'white background image'],
    whatItDoes: 'This AI-powered tool automatically detects the main subject in your uploaded image and removes its background, replacing it with a clean, plain white background. This is ideal for product photos, portraits, or any image where you need to isolate the subject.',
    benefits: [
      'Quickly and automatically remove image backgrounds.',
      'No manual editing skills required, thanks to AI.',
      'Creates professional-looking images with a clean subject focus.',
      'Outputs image with a white background, suitable for various uses.'
    ]
  },
  {
    id: 'image-to-text',
    title: 'Image to Text Converter (OCR) | Extract Text from Images | UniToolBox',
    description: 'Use our AI-powered OCR tool to extract text from images online. Convert photos, screenshots, or scanned documents into editable text. Free and accurate.',
    href: '/tools/image-to-text',
    category: 'Image',
    iconName: 'TextSearch',
    aiPowered: true,
    tags: ['image', 'text', 'ocr', 'extract', 'scan to text'],
    keywords: ['image to text', 'ocr online', 'extract text from image', 'photo to text converter', 'ai ocr', 'scan to text free'],
    whatItDoes: 'Our Image to Text (OCR) tool employs AI to recognize and extract textual content from your uploaded images. This allows you to convert non-editable text within pictures, scans, or screenshots into a selectable and editable format.',
    benefits: [
      'Convert text from images or scanned documents into editable format.',
      'Saves time on manual retyping.',
      'AI-powered for improved accuracy on various image types.',
      'Useful for digitizing printed materials or capturing text from visuals.'
    ]
  },
  {
    id: 'image-to-ico',
    title: 'Image to ICO Converter | Create Favicons Online | UniToolBox',
    description: 'Convert your JPG, PNG, or WebP images into standard icon sizes (e.g., 16x16, 32x32) in PNG format, suitable for use as favicons. Download as a .ico file.',
    href: '/tools/image-to-ico',
    category: 'Image',
    iconName: 'BoxSelect',
    tags: ['image', 'icon', 'ico', 'converter', 'favicon generator'],
    keywords: ['image to ico', 'favicon converter', 'create ico file', 'png to ico online', 'icon generator'],
    whatItDoes: 'This tool converts your images (JPG, PNG, WebP) into fixed-size square PNGs, commonly used for icons like favicons. You can select standard icon dimensions, and the output is downloadable as a .ico file (which is essentially a PNG in this client-side version).',
    benefits: [
      'Easily create basic icons or favicons from existing images.',
      'Supports common icon sizes.',
      'Client-side processing for quick conversions.',
      'Downloadable as a .ico file (containing a PNG).'
    ]
  },
  {
    id: 'photo-to-passport-size',
    title: 'Passport Photo Generator | Create Official Size Photos | UniToolBox',
    description: 'Resize and crop your photo to official passport or visa photo dimensions for various countries (USA, India, UK, Schengen, Canada). Ensures white background. Free online tool.',
    href: '/tools/photo-to-passport-size',
    category: 'Image',
    iconName: 'Camera',
    tags: ['photo', 'passport', 'id', 'resize', 'crop', 'official', 'visa photo'],
    keywords: ['passport photo generator', 'visa photo maker', 'official photo size', 'online passport photo', 'id photo creator', 'photo cropper'],
    whatItDoes: 'This tool helps you create passport or visa-sized photos from your existing images. Select a country preset, and the tool will resize and crop your photo to the specified dimensions, applying a white background as typically required.',
    benefits: [
      'Quickly format photos for passport, visa, or ID applications.',
      'Provides presets for common country-specific dimensions.',
      'Client-side processing for privacy and speed.',
      'Outputs images with a white background, ready for use.'
    ]
  },

  // --- Document & Data Tools ---
  {
    id: 'text-to-pdf',
    title: 'Text to PDF Converter | Convert Plain Text to PDF Free | UniToolBox',
    description: 'Easily convert your plain text files or pasted text into a downloadable PDF document. Customize font and font size. Free and online.',
    href: '/tools/text-to-pdf',
    category: 'Document & Data',
    iconName: 'FileText',
    tags: ['text', 'pdf', 'converter', 'document', 'create pdf'],
    keywords: ['text to pdf', 'convert text to pdf', 'online pdf creator', 'free text to pdf', 'plain text pdf'],
    whatItDoes: 'The Text to PDF Converter takes your plain text input and transforms it into a standard PDF file. You can customize basic formatting options like font family and font size before generating the PDF.',
    benefits: [
      'Create simple PDF documents from plain text quickly.',
      'Basic font and size customization available.',
      'Useful for creating shareable text documents in PDF format.',
      'Client-side conversion for speed and privacy.'
    ]
  },
  {
    id: 'json-to-csv',
    title: 'JSON to CSV Converter | Convert JSON Data Online | UniToolBox',
    description: 'Convert JSON data (arrays of objects, single objects) into CSV format. Handles nested objects by flattening and denormalizes arrays for comprehensive CSV output.',
    href: '/tools/json-to-csv',
    category: 'Document & Data',
    iconName: 'FileJson',
    tags: ['json', 'csv', 'converter', 'data', 'denormalize', 'data transformation'],
    keywords: ['json to csv', 'convert json to csv online', 'json data converter', 'free json to csv', 'nested json to csv'],
    whatItDoes: 'This tool converts JSON (JavaScript Object Notation) data into CSV (Comma-Separated Values) format. It intelligently handles arrays of objects, single objects, and can flatten nested structures and denormalize arrays of sub-objects to ensure all data is represented in the CSV output.',
    benefits: [
      'Convert complex JSON structures into tabular CSV data.',
      'Handles nested objects and arrays of objects effectively.',
      'Useful for data analysis, import into spreadsheets, or database loading.',
      'Client-side processing for data privacy.'
    ]
  },
  {
    id: 'csv-to-json',
    title: 'CSV to JSON Converter | Convert CSV Files Online | UniToolBox',
    description: 'Easily convert your CSV (Comma-Separated Values) data or files into JSON format (array of objects). Free, online, and client-side for privacy.',
    href: '/tools/csv-to-json',
    category: 'Document & Data',
    iconName: 'Database',
    tags: ['csv', 'json', 'converter', 'data', 'data transformation'],
    keywords: ['csv to json', 'convert csv to json online', 'csv data converter', 'free csv to json', 'table to json'],
    whatItDoes: 'The CSV to JSON Converter transforms data from CSV format (typically plain text with comma-separated values) into JSON format, usually as an array of objects where each object represents a row from the CSV.',
    benefits: [
      'Convert tabular CSV data into a structured JSON format.',
      'Useful for web development, API interactions, and data processing pipelines.',
      'Client-side conversion ensures your data stays in your browser.',
      'Simple to use: paste CSV data and convert.'
    ]
  },
  {
    id: 'image-to-pdf',
    title: 'Image to PDF Converter | Combine JPG, PNG to PDF | UniToolBox',
    description: 'Convert one or more images (JPG, PNG, WebP) into a single, consolidated PDF document. Each image is placed on a separate page. Free and online.',
    href: '/tools/image-to-pdf',
    category: 'Document & Data',
    iconName: 'Combine',
    tags: ['image', 'pdf', 'converter', 'document', 'merge', 'combine images'],
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'combine images to pdf', 'free image to pdf converter', 'online pdf creator from images'],
    whatItDoes: 'This tool allows you to combine multiple images (such as JPG, PNG, or WebP) into a single PDF file. Each selected image will be placed on a separate page within the generated PDF, scaled to fit.',
    benefits: [
      'Easily compile multiple images into one shareable PDF document.',
      'Supports common image formats.',
      'Ideal for creating photo albums, portfolios, or merged scanned documents.',
      'Client-side processing for privacy.'
    ]
  },
  {
    id: 'pdf-to-image',
    title: 'PDF to Image Converter | Convert PDF Pages to PNG | UniToolBox',
    description: 'Convert each page of a PDF document into individual, high-quality PNG image files. Free online tool for extracting PDF pages as images.',
    href: '/tools/pdf-to-image',
    category: 'Document & Data',
    iconName: 'FileDown',
    tags: ['pdf', 'image', 'converter', 'extract', 'pages', 'pdf to png'],
    keywords: ['pdf to image', 'pdf to png converter', 'extract pdf pages as images', 'free pdf to image', 'online pdf page extractor'],
    whatItDoes: 'The PDF to Image Converter processes your uploaded PDF file and renders each page as a separate PNG image. This is useful when you need individual pages of a PDF as image files for presentations, web use, or further editing.',
    benefits: [
      'Extract individual pages from a PDF as high-quality PNG images.',
      'Useful for sharing specific PDF pages or using them in other applications.',
      'Client-side conversion for privacy and speed on smaller PDFs.',
      'Download images for each page separately.'
    ]
  },

  // --- Media Tools ---
  {
    id: 'video-compressor',
    title: 'Video Compressor | Reduce Video File Size Online | UniToolBox',
    description: 'Re-encode your videos client-side to reduce file size. Primarily works by scaling resolution. Supported formats: MP4, WebM, MOV, etc. Audio preservation depends on browser.',
    href: '/tools/video-compressor',
    category: 'Media',
    iconName: 'FileVideo',
    tags: ['video', 'compression', 'reduce size', 're-encode', 'client-side', 'video optimizer'],
    keywords: ['video compressor', 'reduce video size online', 'compress mp4 free', 'video file optimizer', 'client-side video compression'],
    whatItDoes: 'This tool re-encodes your uploaded video files directly in your browser to help reduce their size, mainly by adjusting the video resolution (scaling). It aims to make videos more manageable for sharing or storage. Audio track preservation depends on browser capabilities.',
    benefits: [
      'Reduces video file size, making them easier to share and store.',
      'Client-side processing means your video data stays in your browser.',
      'Option to scale video resolution for different levels of compression.',
      'Supports common video formats.'
    ]
  },
  {
    id: 'video-to-gif',
    title: 'Video to GIF Converter | Create Animated GIFs Online | UniToolBox',
    description: 'Convert your video clips (MP4, WebM, MOV) into animated GIFs. Adjust settings like start/end time and frame rate. Free and online (conceptual).',
    href: '/tools/video-to-gif',
    category: 'Media',
    iconName: 'Film',
    tags: ['video', 'gif', 'converter', 'animation', 'create gif'],
    keywords: ['video to gif', 'mp4 to gif converter', 'create animated gif online', 'free video to gif', 'online gif maker'],
    whatItDoes: 'This tool (currently conceptual for full conversion) aims to convert segments of your video files into animated GIF images. You can specify start and end times to select a portion of the video for conversion.',
    benefits: [
      'Create animated GIFs from your video clips for sharing or web use.',
      '(Conceptual) Ability to select specific video segments.',
      '(Conceptual) Options to adjust frame rate and GIF quality.',
      'Supports common video input formats.'
    ]
  },
  {
    id: 'audio-to-text',
    title: 'Audio to Text Converter (Speech Recognition) | UniToolBox',
    description: 'Transcribe speech from your audio files (MP3, WAV, M4A) into editable text using AI-powered speech recognition. Free and accurate online transcription.',
    href: '/tools/audio-to-text',
    category: 'Media',
    iconName: 'AudioLines',
    aiPowered: true,
    tags: ['audio', 'speech', 'text', 'transcription', 'ai', 'speech to text'],
    keywords: ['audio to text', 'transcribe audio online', 'speech to text converter', 'ai transcription free', 'mp3 to text'],
    whatItDoes: 'Our Audio to Text tool uses advanced AI speech recognition to convert spoken words from your audio files into written text. It helps you quickly get a transcript of interviews, lectures, voice memos, or any other audio content.',
    benefits: [
      'Accurately transcribe audio content into editable text.',
      'Saves significant time compared to manual transcription.',
      'AI-powered for handling various accents and audio qualities (within limits).',
      'Supports common audio formats like MP3, WAV, M4A.'
    ]
  },

  // --- Converter Tools (General & Cross-Category) ---
  {
    id: 'webp-to-jpg',
    title: 'WebP to JPG Converter | Convert WebP Images Online Free | UniToolBox',
    description: 'Easily convert your WebP images to the widely supported JPG format. Free, online, and client-side conversion for privacy and speed.',
    href: '/tools/webp-to-jpg',
    category: 'Converter',
    iconName: 'FileType2',
    tags: ['webp', 'jpg', 'image', 'converter', 'image format'],
    keywords: ['webp to jpg', 'convert webp to jpg online', 'free webp converter', 'image format conversion', '.webp to .jpg'],
    whatItDoes: 'This tool converts images from the modern WebP format to the more traditional JPG (JPEG) format. This is useful when you need to use images on platforms or applications that do not yet fully support WebP.',
    benefits: [
      'Convert WebP images to the universally compatible JPG format.',
      'Client-side processing ensures your images stay in your browser.',
      'Simple drag-and-drop or click-to-upload interface.',
      'Quick conversion for individual images.'
    ]
  },
  {
    id: 'jpg-to-webp',
    title: 'JPG to WebP Converter | Optimize Images to WebP Online | UniToolBox',
    description: 'Convert your JPG/JPEG images to the modern, efficient WebP format for better web performance. Free, online, and client-side.',
    href: '/tools/jpg-to-webp',
    category: 'Converter',
    iconName: 'Replace',
    tags: ['jpg', 'jpeg', 'webp', 'image', 'converter', 'image optimization'],
    keywords: ['jpg to webp', 'convert jpg to webp online', 'free webp converter', 'image optimization webp', '.jpg to .webp'],
    whatItDoes: 'Our JPG to WebP Converter transforms your JPEG images into the WebP format, which typically offers better compression and quality characteristics compared to older formats, leading to smaller file sizes and faster web loading times.',
    benefits: [
      'Convert JPG images to the efficient WebP format.',
      'Potentially reduce image file sizes while maintaining quality.',
      'Improve website performance with optimized images.',
      'Client-side conversion for privacy.'
    ]
  },
  {
    id: 'png-to-jpg',
    title: 'PNG to JPG Converter | Convert PNG Images Online Free | UniToolBox',
    description: 'Convert your PNG images to the JPG format. Useful for reducing file size when transparency is not needed. Free, online, and client-side.',
    href: '/tools/png-to-jpg',
    category: 'Converter',
    iconName: 'Replace',
    tags: ['png', 'jpg', 'image', 'converter', 'image format'],
    keywords: ['png to jpg', 'convert png to jpg online', 'free png converter', 'image format conversion', '.png to .jpg'],
    whatItDoes: 'This tool converts images from PNG (Portable Network Graphics) format, often used for images with transparency, to JPG (JPEG) format, which is typically used for photographs and results in smaller file sizes by discarding transparency.',
    benefits: [
      'Convert PNG images to JPG, often reducing file size.',
      'Useful when transparency is not required and smaller files are preferred.',
      'Client-side conversion for speed and privacy.',
      'Simple interface for quick conversions.'
    ]
  },
  {
    id: 'jpg-to-png',
    title: 'JPG to PNG Converter | Convert JPG Images Online Free | UniToolBox',
    description: 'Convert your JPG/JPEG images to the PNG format. PNG is a lossless format often preferred for graphics or when transparency might be needed later. Free and online.',
    href: '/tools/jpg-to-png',
    category: 'Converter',
    iconName: 'FileType2',
    tags: ['jpg', 'jpeg', 'png', 'image', 'converter', 'image format'],
    keywords: ['jpg to png', 'convert jpg to png online', 'free png converter', 'image format conversion', '.jpg to .png'],
    whatItDoes: 'The JPG to PNG Converter transforms your JPEG images into PNG format. PNG is a lossless compression format, which means it retains all image data and quality. It also supports transparency, though converting from JPG (which doesn\'t support transparency) will result in an opaque PNG.',
    benefits: [
      'Convert JPG images to the lossless PNG format.',
      'Preserves image quality without compression artifacts typical of JPG.',
      'Client-side conversion for privacy.',
      'Useful for graphics or when higher fidelity is required.'
    ]
  },
  {
    id: 'svg-to-png',
    title: 'SVG to PNG Converter | Convert SVG to Raster Image | UniToolBox',
    description: 'Convert your SVG (Scalable Vector Graphics) files into rasterized PNG images. Renders SVG to a canvas and exports as PNG. Free and online.',
    href: '/tools/svg-to-png',
    category: 'Converter',
    iconName: 'Palette',
    tags: ['svg', 'png', 'image', 'converter', 'vector', 'rasterize'],
    keywords: ['svg to png', 'convert svg to png online', 'vector to raster', 'free svg converter', '.svg to .png'],
    whatItDoes: 'This tool converts SVG (Scalable Vector Graphics) files into PNG (Portable Network Graphics) raster images. It renders the SVG onto a canvas at its natural or a default size and then exports that rendering as a PNG file.',
    benefits: [
      'Convert scalable SVG graphics into a widely supported raster PNG format.',
      'Useful for when a raster image is needed (e.g., for specific platforms or simpler editing).',
      'Client-side conversion for speed and privacy.',
      'Direct download of the generated PNG.'
    ]
  },
  {
    id: 'png-to-svg',
    title: 'PNG to SVG Converter (Conceptual) | UniToolBox',
    description: 'A conceptual tool that embeds your PNG image within an SVG file. Note: This does not perform true vectorization of the PNG image.',
    href: '/tools/png-to-svg',
    category: 'Converter',
    iconName: 'Palette',
    tags: ['png', 'svg', 'image', 'converter', 'vector', 'conceptual', 'embed'],
    keywords: ['png to svg conceptual', 'embed png in svg', 'raster to svg placeholder', 'online image converter'],
    whatItDoes: 'This tool creates an SVG file that embeds your uploaded PNG image. It is a conceptual converter because true conversion from a raster format (like PNG) to a vector format (SVG) involves complex image tracing (vectorization), which is not performed here. The output SVG will display your PNG.',
    benefits: [
      'Wraps your PNG image within an SVG container.',
      'Can be useful for certain embedding scenarios where an SVG wrapper is needed.',
      'Highlights the difference between embedding and true vectorization.',
      'Client-side operation.'
    ]
  },
  {
    id: 'pdf-word-converter',
    title: 'PDF <=> Word Converter (DOCX) | Free Online Tool | UniToolBox',
    description: 'Convert PDF files to editable Word documents (.docx) and Word documents back to PDF. Client-side conversion with some formatting limitations.',
    href: '/tools/pdf-word-converter',
    category: 'Converter',
    iconName: 'ArrowRightLeft',
    tags: ['pdf', 'word', 'docx', 'converter', 'document', 'edit pdf'],
    keywords: ['pdf to word converter', 'word to pdf converter', 'free pdf docx tool', 'online document conversion', 'edit pdf as word'],
    whatItDoes: 'This tool provides bidirectional conversion between PDF and Word (.docx) formats. PDF to Word attempts to extract text and basic structure into an editable DOCX. Word to PDF converts your DOCX into a PDF, aiming to preserve layout via HTML rendering.',
    benefits: [
      'Convert documents between PDF and Word formats.',
      'Make PDF content editable by converting to DOCX (text extraction focus).',
      'Create shareable PDFs from Word documents.',
      'Client-side processing for document privacy (limitations apply to complex formatting).'
    ]
  },
  {
    id: 'excel-pdf-converter',
    title: 'Excel <=> PDF Converter (XLSX) | Free Online Tool | UniToolBox',
    description: 'Convert Excel spreadsheets (.xlsx) to PDF files for easy sharing, and PDF tables back to Excel (text extraction). Client-side conversion with formatting notes.',
    href: '/tools/excel-pdf-converter',
    category: 'Converter',
    iconName: 'ArrowRightLeft',
    tags: ['excel', 'xlsx', 'pdf', 'converter', 'document', 'spreadsheet to pdf'],
    keywords: ['excel to pdf converter', 'pdf to excel converter', 'free xlsx pdf tool', 'online spreadsheet conversion', 'pdf table to excel'],
    whatItDoes: 'This converter allows you to change Excel (.xlsx) files into PDFs and vice-versa. Excel to PDF converts your spreadsheet data into a PDF table. PDF to Excel attempts to extract tabular data from PDFs into an XLSX file (text-based extraction, formatting may vary).',
    benefits: [
      'Convert spreadsheets to PDFs for sharing or printing.',
      'Attempt to extract data from PDF tables into Excel format.',
      'Client-side conversions for privacy.',
      'Supports common .xlsx and .pdf formats.'
    ]
  },
  {
    id: 'powerpoint-pdf-converter',
    title: 'PowerPoint <=> PDF Converter (PPTX) | UniToolBox',
    description: 'Convert PowerPoint (.pptx) presentations to PDF. PDF to PowerPoint converts PDF pages into images on slides. Client-side with fidelity limitations.',
    href: '/tools/powerpoint-pdf-converter',
    category: 'Converter',
    iconName: 'ArrowRightLeft',
    tags: ['powerpoint', 'pptx', 'pdf', 'converter', 'presentation', 'slides to pdf'],
    keywords: ['powerpoint to pdf converter', 'pdf to powerpoint converter', 'free pptx pdf tool', 'online presentation conversion', 'slides to pdf online'],
    whatItDoes: 'This tool converts PowerPoint (.pptx) files to PDF and PDF files to PowerPoint. PPTX to PDF aims to create a PDF from your presentation (text extraction focus). PDF to PPTX converts each PDF page into a static image placed on a new slide in a PPTX file.',
    benefits: [
      'Convert presentations for easier sharing (PPTX to PDF).',
      'Import PDF content into PowerPoint as images (PDF to PPTX).',
      'Client-side operations for privacy (note formatting limitations).',
      'Supports .pptx and .pdf formats.'
    ]
  },

  // --- Utilities ---
  {
    id: 'unit-converter',
    title: 'All-in-One Unit Converter | Length, Weight, Temp & More | UniToolBox',
    description: 'Comprehensive online unit converter for length, weight, time, temperature, area, volume, speed, pressure, and simulated currency. Free and easy to use.',
    href: '/tools/unit-converter',
    category: 'Utilities',
    iconName: 'Cog',
    tags: ['units', 'measurement', 'conversion', 'length', 'weight', 'temperature', 'currency', 'calculator'],
    keywords: ['unit converter', 'measurement converter', 'online conversion tool', 'length converter', 'weight converter', 'temperature converter', 'currency converter tool'],
    whatItDoes: 'Our All-in-One Unit Converter provides quick and easy conversions across a wide range of measurement categories, including length, weight, temperature, time, area, volume, speed, pressure, and even simulated currency rates.',
    benefits: [
      'Convert between numerous units across various categories.',
      'User-friendly interface for quick selections and input.',
      'Covers common and some specialized units.',
      'Useful for everyday calculations, travel, or academic purposes.'
    ]
  },
  {
    id: 'advanced-calculator',
    title: 'Advanced Calculator & Unit Converter | UniToolBox',
    description: 'A powerful online tool combining a scientific calculator with functions for percentages, GST, EMI, and a comprehensive unit converter for various measurements.',
    href: '/tools/advanced-calculator',
    category: 'Utilities',
    iconName: 'Calculator',
    tags: ['calculator', 'scientific', 'gst', 'emi', 'finance', 'math', 'unit converter', 'percentage'],
    keywords: ['advanced calculator online', 'scientific calculator', 'gst calculator', 'emi calculator', 'unit converter tool', 'percentage calculator', 'financial calculator'],
    whatItDoes: 'This versatile tool integrates an advanced calculator supporting standard arithmetic, scientific functions, percentage calculations, GST (Goods and Services Tax), and EMI (Equated Monthly Instalment) with a comprehensive unit converter. It\'s designed for a wide range of mathematical and conversion tasks.',
    benefits: [
      'Perform diverse calculations: basic, scientific, financial (GST, EMI), and percentages.',
      'Includes a multi-category unit converter for quick measurements changes.',
      'Features a calculation history for easy review.',
      'User-friendly interface suitable for various calculation needs.'
    ]
  },
  {
    id: 'password-generator',
    title: 'Secure Password Generator | Create Strong Passwords | UniToolBox',
    description: 'Generate strong, random, and customizable passwords. Options for length, character sets (uppercase, lowercase, numbers, symbols), excluding similar characters, and pronounceable passwords. Includes strength meter and local saving.',
    href: '/tools/password-generator',
    category: 'Utilities',
    iconName: 'KeyRound',
    tags: ['password', 'security', 'generator', 'secure', 'customizable', 'random password'],
    keywords: ['password generator', 'strong password creator', 'random password generator', 'secure password tool', 'custom password options', 'pronounceable password'],
    whatItDoes: 'Our Password Generator helps you create strong, unique passwords tailored to your security needs. You can customize the length, include or exclude character types (uppercase, lowercase, numbers, symbols), opt for pronounceable passwords, and even exclude visually similar characters. Generated passwords can be saved locally for the session.',
    benefits: [
      'Generate highly secure and random passwords.',
      'Extensive customization options for password complexity.',
      'Includes a password strength indicator.',
      'Option for pronounceable passwords that are easier to remember yet still complex.',
      'Ability to generate multiple passwords at once and save the batch locally.'
    ]
  },
  {
    id: 'password-strength-checker',
    title: 'Password Strength Checker | Analyze Password Security | UniToolBox',
    description: 'Check the strength of your passwords in real-time. Our tool analyzes length, character variety, common patterns, and provides an estimated crack time, along with suggestions for improvement. Batch checking available.',
    href: '/tools/password-strength-checker',
    category: 'Utilities',
    iconName: 'ShieldCheck',
    tags: ['password', 'security', 'checker', 'strength', 'analyzer', 'password meter'],
    keywords: ['password strength checker', 'analyze password security', 'password meter online', 'check password strength', 'secure password test', 'password safety'],
    whatItDoes: 'This tool evaluates the strength of your passwords based on several criteria, including length, use of different character types (uppercase, lowercase, numbers, symbols), and common weak patterns. It provides a strength score, textual feedback, suggestions for improvement, and a very rough estimate of the time it might take to crack.',
    benefits: [
      'Get an instant assessment of your password\'s security level.',
      'Receive actionable suggestions to make your passwords stronger.',
      'Understand factors contributing to password vulnerability.',
      'Supports checking multiple passwords in a batch for quick analysis.'
    ]
  },
];

export const featuredTools: Tool[] = tools.filter(tool => ['unit-converter', 'photo-to-passport-size', 'voice-notes-to-text', 'advanced-calculator', 'essay-summarizer', 'image-compressor'].includes(tool.id)).slice(0, 6);

export const getToolById = (id: string): Tool | undefined => tools.find(tool => tool.id === id);

export const getToolsByCategory = (category: ToolCategory): Tool[] => tools.filter(tool => tool.category === category);

    