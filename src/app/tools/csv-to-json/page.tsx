
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { CsvToJsonClient } from './csv-to-json-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('csv-to-json');
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

export default function CsvToJsonPage() {
  const tool = getToolById('csv-to-json');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Paste your CSV (Comma-Separated Values) data into the input text area.",
    "Ensure your CSV data is well-formatted. The first row will be treated as headers for the JSON objects.",
    "Click the 'Convert to JSON' button.",
    "The tool will process the CSV and generate an array of JSON objects, where each object represents a row from your CSV.",
    "The generated JSON data will appear in the output area, ready for review, copying, or downloading as a .json file."
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
      <CsvToJsonClient />
    </ToolPageTemplate>
  );
}

    