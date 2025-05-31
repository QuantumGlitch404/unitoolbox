
import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { WebPToJPGClient } from './webp-to-jpg-client';
import { FileType2 } from 'lucide-react';

export default function WebPToJPGPage() {
  const tool = getToolById('webp-to-jpg');

  if (!tool) {
    return <div>Tool not found: webp-to-jpg</div>;
  }

  const instructions = [
    `Upload your ${tool.title.split(' ')[0]} image file.`,
    "Click the 'Convert to JPG' button.",
    "Wait for the (simulated) conversion to complete.",
    "Preview and download your JPG image."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon || FileType2}
      instructions={instructions}
    >
      <WebPToJPGClient
        sourceFormat="WebP"
        targetFormat="JPG"
        accept={{ 'image/webp': ['.webp'] }}
        outputFileNameSuffix="_converted.jpg"
        toolIcon={tool.icon || FileType2}
      />
    </ToolPageTemplate>
  );
}
