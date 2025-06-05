
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { ImageToPdfClient } from './image-to-pdf-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('image-to-pdf');
  if (!tool) {
    return {
      title: 'Tool Not Found | UniToolBox',
      description: 'The requested tool could not be found.',
    };
  }
  return {
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
  };
}

export default function ImageToPdfPage() {
  const tool = getToolById('image-to-pdf');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload one or more images (JPG, PNG, WebP) using the dropzone or file selector.",
    "The selected images will be displayed with options to remove individual images or clear all.",
    "Images will be added to the PDF in the order they appear in the preview list.",
    "Click the 'Convert to PDF' button.",
    "The tool will process the images and create a single PDF document, with each image placed on a separate page and scaled to fit.",
    "A download link for your generated PDF file will appear once the conversion is complete."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName}
      whatItDoes={tool.whatItDoes}
      benefits={tool.benefits}
      instructions={instructions}
    >
      <AdPlaceholder type="banner" className="mb-6" />
      <ImageToPdfClient />
    </ToolPageTemplate>
  );
}

    