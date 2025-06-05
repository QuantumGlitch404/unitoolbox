
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { TextToPdfClient } from './text-to-pdf-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('text-to-pdf');
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

export default function TextToPdfPage() {
  const tool = getToolById('text-to-pdf');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Enter or paste the text you want to convert into the 'Text Content' area.",
    "Select your desired 'Font Family' and 'Font Size (pt)' from the dropdowns and input field.",
    "Specify an 'Output Filename' for your PDF (e.g., 'my_document.pdf').",
    "Click the 'Convert to PDF' button.",
    "The tool will generate a PDF file with your text and formatting.",
    "A download link for your generated PDF will appear."
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
      <TextToPdfClient />
    </ToolPageTemplate>
  );
}

    