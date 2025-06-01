
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { AdvancedCalculatorClient } from './advanced-calculator-client';
import { Calculator } from 'lucide-react';

export default function AdvancedCalculatorPage() {
  const tool = getToolById('advanced-calculator');

  if (!tool) {
    return <div>Tool not found: advanced-calculator</div>;
  }

  const instructions = [
    "Select a mode: Calculator or Unit Converter.",
    "Calculator: Use the keypad for standard, scientific, percentage, GST, or EMI calculations. View history below.",
    "Unit Converter: Select category, input value, and choose units for conversion (e.g., Length, Weight, Temperature).",
    "Currency conversion uses placeholder rates; real API integration needed for live data.",
    "Copy results or download calculation summaries/conversion details.",
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon || Calculator}
      instructions={instructions}
    >
      <AdvancedCalculatorClient />
    </ToolPageTemplate>
  );
}
