
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { ImageResizerClient } from './image-resizer-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';

export default function ImageResizerPage() {
  const tool = getToolById('image-resizer');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload an image using the dropzone or file selector.",
    "Enter the desired width and height in pixels.",
    "Click the 'Resize Image' button.",
    "The resized image preview and a download link will appear."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'SlidersHorizontal'}
      instructions={instructions}
    >
      <AdPlaceholder type="banner" className="mb-6" />
      <ImageResizerClient />
    </ToolPageTemplate>
  );
}

    