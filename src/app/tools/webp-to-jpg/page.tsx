
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { WebPToJPGClient } from './webp-to-jpg-client';
// FileType2 import not needed for default

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
      iconName={tool.iconName || 'FileType2'}
      instructions={instructions}
    >
      <WebPToJPGClient
        sourceFormat="WebP"
        targetFormat="JPG"
        accept={{ 'image/webp': ['.webp'] }}
        outputFileNameSuffix="_converted.jpg"
      />
    </ToolPageTemplate>
  );
}

    