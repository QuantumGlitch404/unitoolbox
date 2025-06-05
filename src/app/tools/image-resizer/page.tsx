
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { ImageResizerClient } from './image-resizer-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('image-resizer');
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

export default function ImageResizerPage() {
  const tool = getToolById('image-resizer');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload an image file (JPG, PNG, WebP, GIF) using the dropzone or file selector.",
    "Enter the desired 'Width' and 'Height' in pixels for your resized image.",
    "Click the 'Resize Image' button.",
    "The tool will process your image (simulated for this client-side version).",
    "A preview of the (conceptually) resized image and a download link will appear."
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
      <ImageResizerClient />
    </ToolPageTemplate>
  );
}

    