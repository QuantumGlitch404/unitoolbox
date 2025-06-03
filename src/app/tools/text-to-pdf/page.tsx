
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { TextToPdfClient } from './text-to-pdf-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
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
      <AdPlaceholder type="banner" className="mb-6" />
      <TextToPdfClient />
    </ToolPageTemplate>
  );
}

    