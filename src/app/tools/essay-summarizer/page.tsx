
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { EssaySummarizerClient } from './essay-summarizer-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('essay-summarizer');
  if (!tool) {
    return {
      title: 'Tool Not Found | UniToolBox',
      description: 'The requested tool could not be found.',
    };
  }
  return {
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
  };
}

export default function EssaySummarizerPage() {
  const tool = getToolById('essay-summarizer');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Paste your essay or long text into the designated text area.",
    "Click the 'Summarize Essay' button.",
    "Wait for the AI to process the text and generate a concise summary.",
    "The summarized version will appear in the output area below.",
    "Review the summary for key insights from your original text."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName}
      whatItDoes={tool.whatItDoes}
      benefits={tool.benefits}
      instructions={instructions}
    >
      <AdPlaceholder type="banner" className="mb-6" />
      <EssaySummarizerClient />
    </ToolPageTemplate>
  );
}

    