import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { TextToPdfClient } from './text-to-pdf-client';
import { FileText } from 'lucide-react'; // Placeholder, tool data has icon

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
      icon={tool.icon || FileText}
      instructions={instructions}
    >
      <TextToPdfClient />
    </ToolPageTemplate>
  );
}
