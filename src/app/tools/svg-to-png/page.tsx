
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { SVGToPNGClient } from './svg-to-png-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('svg-to-png');
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

export default function SVGToPNGPage() {
  const tool = getToolById('svg-to-png');

  if (!tool) {
    return <div>Tool not found: svg-to-png</div>;
  }

  const instructions = [
    `Upload your SVG (Scalable Vector Graphics) image file using the dropzone or file selector.`,
    "Click the 'Convert to PNG' button.",
    "Wait for the client-side conversion to complete. The SVG will be rendered onto a canvas.",
    "A preview of the rasterized PNG image will be displayed.",
    "Download your newly converted PNG image. The dimensions of the PNG will depend on the SVG's defined size or a default rendering size."
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
      <SVGToPNGClient
        sourceFormat="SVG"
        targetFormat="PNG"
        accept={{ 'image/svg+xml': ['.svg'] }}
        outputFileNameSuffix="_converted.png"
      />
    </ToolPageTemplate>
  );
}

    