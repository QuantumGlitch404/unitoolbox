
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { TextToPdfClient } from './text-to-pdf-client';
// FileText import not needed for default

export default function TextToPdfPage() {
  const tool = getToolById('text-to-pdf');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Enter or paste your text into the text area.",
    "Customize font, size, and other options (if available).",
    "Click 'Convert to PDF'.",
    "Download your generated PDF file."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'FileText'}
      instructions={instructions}
    >
      <TextToPdfClient />
    </ToolPageTemplate>
  );
}

    