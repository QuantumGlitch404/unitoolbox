
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { AdvancedCalculatorClient } from './advanced-calculator-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('advanced-calculator');
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

export default function AdvancedCalculatorPage() {
  const tool = getToolById('advanced-calculator');

  if (!tool) {
    return <div>Tool not found: advanced-calculator</div>;
  }

  const instructions = [
    "Use the tabs to switch between 'Advanced Calculator' and 'Unit Converter' modes.",
    "**Calculator Mode:** Use the on-screen keypad for standard arithmetic, square root (√), square (x²), and percentage (%) calculations. Results and history are displayed. Includes sub-tools for GST and EMI calculations: fill in the respective fields and click calculate.",
    "**Unit Converter Mode:** Select a 'Category' (e.g., Length, Weight, Temperature, Currency). Enter the value, choose 'From Unit' and 'To Unit'. The result updates automatically.",
    "Note for Currency: Conversion uses placeholder rates; real API integration is needed for live data.",
    "You can copy results from the calculator history or the unit converter."
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
      <AdvancedCalculatorClient />
    </ToolPageTemplate>
  );
}

    