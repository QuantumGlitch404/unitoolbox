
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { UnitConverterClient } from './unit-converter-client';
import { Cog } from 'lucide-react';

export default function UnitConverterPage() {
  const tool = getToolById('unit-converter');

  if (!tool) {
    return <div>Tool not found: unit-converter</div>;
  }

  const instructions = [
    "Select the category of unit you want to convert (e.g., Length, Weight, Temperature).",
    "Enter the value you wish to convert in the 'Value' field.",
    "Select the 'From Unit' and 'To Unit' from the dropdown menus.",
    "The converted value will be displayed automatically.",
    "For currency, select base and target currencies. Live rates are simulated; actual API integration is needed for real-time data.",
    "You can copy the result or download it as a TXT or PDF file (for the current single conversion)."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon || Cog}
      instructions={instructions}
    >
      <UnitConverterClient />
    </ToolPageTemplate>
  );
}
