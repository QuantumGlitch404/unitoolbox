
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { JPGToWebPClient } from './jpg-to-webp-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
// Replace import not needed for default

export default function JPGToWebPPage() {
  const tool = getToolById('jpg-to-webp');

  if (!tool) {
    return <div>Tool not found: jpg-to-webp</div>;
  }

  const instructions = [
    `Upload your JPG or JPEG image file.`,
    "Click the 'Convert to WebP' button.",
    "Wait for the (simulated) conversion to complete.",
    "Preview and download your WebP image."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'Replace'}
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

    