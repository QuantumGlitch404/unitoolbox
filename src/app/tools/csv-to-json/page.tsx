
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { CsvToJsonClient } from './csv-to-json-client';
import { Database } from 'lucide-react';

export default function CsvToJsonPage() {
  const tool = getToolById('csv-to-json');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Paste your CSV data into the input area.",
    "Ensure your CSV is well-formatted. The first row will be treated as headers.",
    "Click the 'Convert to JSON' button.",
    "The generated JSON (an array of objects) will appear in the output area.",
    "You can then copy the JSON data or download it as a .json file."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon || Database}
      instructions={instructions}
    >
      <CsvToJsonClient />
    </ToolPageTemplate>
  );
}
