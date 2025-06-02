
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { AsciiToTextClient } from './ascii-to-text-client';

export default function AsciiToTextPage() {
  const tool = getToolById('ascii-to-text');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Paste your ASCII encoded text into the input area.",
    "Click the 'Convert to Text' button.",
    "The decoded, human-readable text will appear in the output area."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'Type'}
      instructions={instructions}
    >
      <AsciiToTextClient />
    </ToolPageTemplate>
  );
}

    