
import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { SVGToPNGClient } from './svg-to-png-client';
import { Palette } from 'lucide-react';

export default function SVGToPNGPage() {
  const tool = getToolById('svg-to-png');

  if (!tool) {
    return <div>Tool not found: svg-to-png</div>;
  }

  const instructions = [
    `Upload your SVG image file.`,
    "Click the 'Convert to PNG' button.",
    "Wait for the (simulated) conversion to complete.",
    "Preview and download your PNG image. (Note: True client-side SVG to PNG rendering for download is complex and might be simplified here)."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon || Palette}
      instructions={instructions}
    >
      <SVGToPNGClient
        sourceFormat="SVG"
        targetFormat="PNG"
        accept={{ 'image/svg+xml': ['.svg'] }}
        outputFileNameSuffix="_converted.png"
      />
    </ToolPageTemplate>
  );
}
