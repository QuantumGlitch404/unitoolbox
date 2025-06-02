
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { JPGToPNGClient } from './jpg-to-png-client';
// FileType2 import not needed for default

export default function JPGToPNGPage() {
  const tool = getToolById('jpg-to-png');

  if (!tool) {
    return <div>Tool not found: jpg-to-png</div>;
  }

  const instructions = [
    `Upload your JPG or JPEG image file.`,
    "Click the 'Convert to PNG' button.",
    "Wait for the (simulated) conversion to complete.",
    "Preview and download your PNG image."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'FileType2'}
      instructions={instructions}
    >
      <JPGToPNGClient
        sourceFormat="JPG/JPEG"
        targetFormat="PNG"
        accept={{ 'image/jpeg': ['.jpg', '.jpeg'] }}
        outputFileNameSuffix="_converted.png"
      />
    </ToolPageTemplate>
  );
}

    