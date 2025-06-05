
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { UnitConverterClient } from './unit-converter-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('unit-converter');
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

export default function UnitConverterPage() {
  const tool = getToolById('unit-converter');

  if (!tool) {
    return <div>Tool not found: unit-converter</div>;
  }

  const instructions = [
    "Select the 'Category' of unit you want to convert (e.g., Length, Weight, Temperature, Currency).",
    "Enter the numerical 'Value' you wish to convert in the input field.",
    "Select the 'From Unit' (the unit you are converting from) from the dropdown menu.",
    "Select the 'To Unit' (the unit you want to convert to) from the dropdown menu.",
    "The converted value will be displayed automatically in the 'Conversion Result' card.",
    "For currency conversions, note that rates are for demonstration and may not be live; a real API integration would be needed for up-to-date exchange rates.",
    "You can copy the result or download it as a TXT or PDF file, which will contain the details of the current conversion."
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
      <UnitConverterClient />
    </ToolPageTemplate>
  );
}

    