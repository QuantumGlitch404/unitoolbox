
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { ImageCompressorClient } from './image-compressor-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('image-compressor');
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

export default function ImageCompressorPage() {
  const tool = getToolById('image-compressor');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload an image file (JPG, PNG, WebP, GIF) using the dropzone or file selector.",
    "Adjust the 'Compression Level' slider to your desired setting (higher percentage means more compression, potentially lower quality).",
    "Click the 'Compress Image' button.",
    "The tool will process your image (simulated for this client-side version).",
    "View the compression results, including original size, new size, and reduction percentage.",
    "Download the compressed image."
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
      <ImageCompressorClient />
    </ToolPageTemplate>
  );
}

    