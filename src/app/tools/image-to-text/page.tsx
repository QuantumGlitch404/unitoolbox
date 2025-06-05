
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { ImageToTextClient } from './image-to-text-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('image-to-text');
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

export default function ImageToTextPage() {
  const tool = getToolById('image-to-text');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload an image file (JPG, PNG, WebP) that contains the text you want to extract.",
    "Click the 'Extract Text with AI' button.",
    "The AI will perform Optical Character Recognition (OCR) on the image.",
    "The extracted text will appear in the text area below.",
    "You can then copy the extracted text for your use."
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
      <ImageToTextClient />
    </ToolPageTemplate>
  );
}

    