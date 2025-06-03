
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { BookSummaryCreatorClient } from './book-summary-creator-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
// BookText import not needed for default

export default function BookSummaryCreatorPage() {
  const tool = getToolById('book-summary-creator');

  if (!tool) {
    return <div>Tool not found: book-summary-creator</div>;
  }

  const instructions = [
    "Paste your text or upload a .txt file for summarization.",
    "Select the desired summary length (short, medium, long) and detail level using the slider.",
    "Click 'Generate Summary with AI'. The AI will process your text based on your preferences.",
    "The AI-generated summary will appear, attempting to extract key points and follow chapter structure if discernible.",
    "You can then copy the summary, download it as a .txt or .pdf file, or load your last saved summary from local storage."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'BookText'}
      instructions={instructions}
    >
      <AdPlaceholder type="banner" className="mb-6" />
      <BookSummaryCreatorClient />
    </ToolPageTemplate>
  );
}

    