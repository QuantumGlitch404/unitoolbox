
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { BookSummaryCreatorClient } from './book-summary-creator-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('book-summary-creator');
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

export default function BookSummaryCreatorPage() {
  const tool = getToolById('book-summary-creator');

  if (!tool) {
    return <div>Tool not found: book-summary-creator</div>;
  }

  const instructions = [
    "Paste your text or upload a .txt file containing the content you want to summarize.",
    "Select the desired summary length (short, medium, or long).",
    "Adjust the summary detail level using the slider (0% for very brief, 100% for highly detailed).",
    "Click 'Generate Summary with AI'. The AI will process your text based on these preferences.",
    "Review the generated summary, which will attempt to extract key points and follow chapter structure if discernible.",
    "You can then copy the summary or download it as a .txt or .pdf file.",
    "Use 'Load Last Saved Summary' to retrieve previously generated content from your browser's local storage."
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
      <BookSummaryCreatorClient />
    </ToolPageTemplate>
  );
}

    