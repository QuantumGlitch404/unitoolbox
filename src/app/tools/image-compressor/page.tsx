
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { ImageCompressorClient } from './image-compressor-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';

export default function ImageCompressorPage() {
  const tool = getToolById('image-compressor');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Click 'Upload Image' or drag and drop an image file.",
    "Adjust the compression level using the slider (if available).",
    "Click the 'Compress Image' button.",
    "The compressed image details and a download link will appear."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'Scissors'}
      instructions={instructions}
    >
      <ImageCompressorClient />
      <div className="mt-12">
        <AdPlaceholder type="mediumRectangle" className="mx-auto" />
      </div>
    </ToolPageTemplate>
  );
}
