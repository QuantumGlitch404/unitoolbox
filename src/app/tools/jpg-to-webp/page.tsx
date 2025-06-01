
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { JPGToWebPClient } from './jpg-to-webp-client';
import { Replace } from 'lucide-react';

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
      icon={tool.icon || Replace}
      instructions={instructions}
    >
      <JPGToWebPClient
        sourceFormat="JPG/JPEG"
        targetFormat="WebP"
        accept={{ 'image/jpeg': ['.jpg', '.jpeg'] }}
        outputFileNameSuffix="_converted.webp"
      />
    </ToolPageTemplate>
  );
}
