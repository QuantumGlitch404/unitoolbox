
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { ImageBackgroundRemoverClient } from './image-background-remover-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';

export default function ImageBackgroundRemoverPage() {
  const tool = getToolById('image-background-remover');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload an image (JPG, PNG, WebP).",
    "Click the 'Remove Background (AI)' button.",
    "The AI will process your image to identify the main subject and replace the background with plain white.",
    "Preview the result. The processed image (with a white background) can be downloaded."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'Wand2'}
      instructions={instructions}
    >
      <AdPlaceholder type="banner" className="mb-6" />
      <ImageBackgroundRemoverClient />
    </ToolPageTemplate>
  );
}

    