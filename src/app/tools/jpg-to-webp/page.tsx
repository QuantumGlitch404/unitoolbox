
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { JPGToWebPClient } from './jpg-to-webp-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('jpg-to-webp');
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

export default function JPGToWebPPage() {
  const tool = getToolById('jpg-to-webp');

  if (!tool) {
    return <div>Tool not found: jpg-to-webp</div>;
  }

  const instructions = [
    `Upload your JPG or JPEG image file using the dropzone or file selector.`,
    "Click the 'Convert to WebP' button.",
    "Wait for the client-side conversion to complete. Progress will be indicated.",
    "A preview of the converted WebP image will be displayed (if your browser supports WebP preview), and a download link will become available.",
    "Download your newly converted WebP image."
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
      <JPGToWebPClient
        sourceFormat="JPG/JPEG"
        targetFormat="WebP"
        accept={{ 'image/jpeg': ['.jpg', '.jpeg'] }}
        outputFileNameSuffix="_converted.webp"
      />
    </ToolPageTemplate>
  );
}

    