
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { ImageToIcoClient } from './image-to-ico-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('image-to-ico');
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

export default function ImageToIcoPage() {
  const tool = getToolById('image-to-ico');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload your image file (JPG, PNG, WebP).",
    "Select the desired icon size from the dropdown menu (e.g., 16x16, 32x32, 48x48).",
    "Click the 'Convert to Icon' button.",
    "The image will be resized to your selected dimensions and converted to PNG format.",
    "Download the resulting file, which will be named with a .ico extension (containing the PNG data), suitable for use as a favicon or basic icon."
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
      <ImageToIcoClient />
    </ToolPageTemplate>
  );
}

    