
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { JPGToPNGClient } from './jpg-to-png-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('jpg-to-png');
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

export default function JPGToPNGPage() {
  const tool = getToolById('jpg-to-png');

  if (!tool) {
    return <div>Tool not found: jpg-to-png</div>;
  }

  const instructions = [
    `Upload your JPG or JPEG image file using the dropzone or file selector.`,
    "Click the 'Convert to PNG' button.",
    "Wait for the client-side conversion to complete. Progress will be indicated.",
    "A preview of the converted PNG image will be displayed.",
    "Download your newly converted PNG image."
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
      <JPGToPNGClient
        sourceFormat="JPG/JPEG"
        targetFormat="PNG"
        accept={{ 'image/jpeg': ['.jpg', '.jpeg'] }}
        outputFileNameSuffix="_converted.png"
      />
    </ToolPageTemplate>
  );
}

    