import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { EssaySummarizerClient } from './essay-summarizer-client';
import { Wand2 } from 'lucide-react'; // Placeholder, tool data has icon

export default function EssaySummarizerPage() {
  const tool = getToolById('essay-summarizer');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Paste your essay into the text area.",
    "Click the 'Summarize Essay' button.",
    "Wait for the AI to process the text.",
    "The summarized version will appear below."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon || Wand2}
      instructions={instructions}
    >
      <EssaySummarizerClient />
    </ToolPageTemplate>
  );
}
