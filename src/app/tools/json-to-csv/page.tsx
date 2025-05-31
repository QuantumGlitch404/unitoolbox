import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { JsonToCsvClient } from './json-to-csv-client';
import { FileJson } from 'lucide-react'; // Placeholder, tool data has icon

export default function JsonToCsvPage() {
  const tool = getToolById('json-to-csv');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Paste your JSON data into the input area.",
    "Ensure your JSON is valid. An array of objects is typical for CSV conversion.",
    "Click 'Convert to CSV'.",
    "The generated CSV data will appear in the output area. You can then copy or download it."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon || FileJson}
      instructions={instructions}
    >
      <JsonToCsvClient />
    </ToolPageTemplate>
  );
}
