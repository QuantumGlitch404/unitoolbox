
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { JsonToCsvClient } from './json-to-csv-client';
// FileJson import not needed here for default

export default function JsonToCsvPage() {
  const tool = getToolById('json-to-csv');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Paste your JSON data. It can be an array of objects, a single object, or an object containing a single key whose value is an array of objects (e.g. {\"data\": [{...}]}).",
    "Ensure your JSON is valid.",
    "Nested objects will be flattened using dot notation for headers (e.g., 'user.address.street').",
    "Arrays of objects (e.g., a 'orders' list for a customer) will be denormalized: each object in such an array will create a new row in the CSV, repeating parent data. Headers for these nested items will be prefixed (e.g., 'orders.orderId').",
    "Other arrays (e.g., arrays of strings or numbers) will be represented as JSON strings within their cells.",
    "Click 'Convert to CSV'. The generated CSV data will appear for review, copy, or download."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'FileJson'}
      instructions={instructions}
    >
      <JsonToCsvClient />
    </ToolPageTemplate>
  );
}

    