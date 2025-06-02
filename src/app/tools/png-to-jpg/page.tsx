
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { PNGToJPGClient } from './png-to-jpg-client';
// Replace import not needed for default

export default function PNGToJPGPage() {
  const tool = getToolById('png-to-jpg');

  if (!tool) {
    return <div>Tool not found: png-to-jpg</div>;
  }

  const instructions = [
    `Upload your PNG image file.`,
    "Click the 'Convert to JPG' button.",
    "Wait for the (simulated) conversion to complete.",
    "Preview and download your JPG image."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'Replace'}
      instructions={instructions}
    >
      <PNGToJPGClient
        sourceFormat="PNG"
        targetFormat="JPG"
        accept={{ 'image/png': ['.png'] }}
        outputFileNameSuffix="_converted.jpg"
      />
    </ToolPageTemplate>
  );
}

    