
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { AsciiToTextClient } from './ascii-to-text-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('ascii-to-text');
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

export default function AsciiToTextPage() {
  const tool = getToolById('ascii-to-text');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Paste your ASCII encoded text into the input area. For example, space-separated decimal character codes like '72 101 108 108 111'.",
    "Click the 'Convert to Text' button.",
    "The tool will attempt to decode the ASCII input into human-readable text.",
    "The decoded text will appear in the output area below."
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
      <AsciiToTextClient />
    </ToolPageTemplate>
  );
}

    