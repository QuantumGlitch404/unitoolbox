
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { PNGToSVGClient } from './png-to-svg-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('png-to-svg');
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

export default function PNGToSVGPage() {
  const tool = getToolById('png-to-svg');

  if (!tool) {
    return <div>Tool not found: png-to-svg</div>;
  }

  const instructions = [
    `Upload your PNG image file using the dropzone or file selector.`,
    "Click the 'Convert to SVG' button.",
    "This tool will create an SVG file that embeds your original PNG image. It does not perform true vectorization (tracing the image into vector paths).",
    "A preview of the SVG (which will look like your PNG) will be displayed.",
    "Download the generated SVG file."
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

    