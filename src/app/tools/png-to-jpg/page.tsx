
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { PNGToJPGClient } from './png-to-jpg-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('png-to-jpg');
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

export default function PNGToJPGPage() {
  const tool = getToolById('png-to-jpg');

  if (!tool) {
    return <div>Tool not found: png-to-jpg</div>;
  }

  const instructions = [
    `Upload your PNG image file using the dropzone or file selector.`,
    "Click the 'Convert to JPG' button.",
    "Wait for the client-side conversion to complete. Progress will be indicated.",
    "A preview of the converted JPG image will be displayed (transparency from PNG will be replaced with a white background).",
    "Download your newly converted JPG image."
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
      <PNGToJPGClient
        sourceFormat="PNG"
        targetFormat="JPG"
        accept={{ 'image/png': ['.png'] }}
        outputFileNameSuffix="_converted.jpg"
      />
    </ToolPageTemplate>
  );
}

    