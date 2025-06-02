
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { PNGToSVGClient } from './png-to-svg-client';
// Palette import not needed for default

export default function PNGToSVGPage() {
  const tool = getToolById('png-to-svg');

  if (!tool) {
    return <div>Tool not found: png-to-svg</div>;
  }

  const instructions = [
    `Upload your PNG image file.`,
    "Click the 'Convert to SVG' button.",
    "Wait for the (conceptual) conversion to complete.",
    "Download the placeholder SVG. True PNG to SVG (vectorization) is a complex process not fully implemented client-side here."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'Palette'}
      instructions={instructions}
    >
      <PNGToSVGClient
        sourceFormat="PNG"
        targetFormat="SVG"
        accept={{ 'image/png': ['.png'] }}
        outputFileNameSuffix="_converted.svg"
        isConceptual={true}
      />
    </ToolPageTemplate>
  );
}

    