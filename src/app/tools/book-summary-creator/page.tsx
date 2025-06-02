
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { BookSummaryCreatorClient } from './book-summary-creator-client';
import { BookText } from 'lucide-react';

export default function BookSummaryCreatorPage() {
  const tool = getToolById('book-summary-creator');

  if (!tool) {
    return <div>Tool not found: book-summary-creator</div>;
  }

  const instructions = [
    "Paste your text or upload a .txt file for summarization.",
    "Select the desired summary length (short, medium, long).",
    "Click 'Generate Summary'. (Actual AI summarization is conceptual).",
    "The tool will provide a basic summary (e.g., truncation).",
    "Key point extraction, chapter summaries, and detail slider are conceptual features.",
    "Download or copy the summary."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon || BookText}
      instructions={instructions}
    >
      <BookSummaryCreatorClient />
    </ToolPageTemplate>
  );
}
