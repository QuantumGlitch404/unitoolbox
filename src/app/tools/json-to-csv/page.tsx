
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { JsonToCsvClient } from './json-to-csv-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('json-to-csv');
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

export default function JsonToCsvPage() {
  const tool = getToolById('json-to-csv');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Paste your JSON data into the input area. This can be an array of objects, a single object, or an object with a single key whose value is an array (e.g. {\"data\": [{...}]}).",
    "Ensure your JSON is valid. The tool will provide an error message if the JSON is malformed.",
    "The converter handles nested objects by flattening them using dot notation for headers (e.g., 'user.address.street').",
    "Arrays of objects (e.g., a list of 'orders' for a 'customer') will be denormalized: each object in such an array creates a new row in the CSV, repeating parent data. Headers for these nested items are prefixed (e.g., 'orders.orderId').",
    "Other arrays (like arrays of strings or numbers) are represented as JSON strings within their respective cells.",
    "Click the 'Convert to CSV' button.",
    "The generated CSV data will appear in the output area, ready for review, copying, or downloading as a .csv file."
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
      <JsonToCsvClient />
    </ToolPageTemplate>
  );
}

    