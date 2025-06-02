
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { EssaySummarizerClient } from './essay-summarizer-client';
// Wand2 import is no longer needed here for the default

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
      iconName={tool.iconName || 'Wand2'} // Pass iconName, provide default string
      instructions={instructions}
    >
      <EssaySummarizerClient />
    </ToolPageTemplate>
  );
}

    