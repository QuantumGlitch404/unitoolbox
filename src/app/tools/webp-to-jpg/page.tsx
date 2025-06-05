
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { WebPToJPGClient } from './webp-to-jpg-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('webp-to-jpg');
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

export default function WebPToJPGPage() {
  const tool = getToolById('webp-to-jpg');

  if (!tool) {
    return <div>Tool not found: webp-to-jpg</div>;
  }

  const instructions = [
    `Upload your WebP image file using the dropzone or file selector.`,
    "Click the 'Convert to JPG' button.",
    "Wait for the client-side conversion to complete. Progress will be indicated.",
    "A preview of the converted JPG image will be displayed, and a download link will become available.",
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
      <WebPToJPGClient
        sourceFormat="WebP"
        targetFormat="JPG"
        accept={{ 'image/webp': ['.webp'] }}
        outputFileNameSuffix="_converted.jpg"
      />
    </ToolPageTemplate>
  );
}

    