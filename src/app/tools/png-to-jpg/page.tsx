
import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { PNGToJPGClient } from './png-to-jpg-client';
import { Replace } from 'lucide-react';

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
      icon={tool.icon || Replace}
      instructions={instructions}
    >
      <PNGToJPGClient
        sourceFormat="PNG"
        targetFormat="JPG"
        accept={{ 'image/png': ['.png'] }}
        outputFileNameSuffix="_converted.jpg"
        toolIcon={tool.icon || Replace}
      />
    </ToolPageTemplate>
  );
}
