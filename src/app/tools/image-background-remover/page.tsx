
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { ImageBackgroundRemoverClient } from './image-background-remover-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('image-background-remover');
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

export default function ImageBackgroundRemoverPage() {
  const tool = getToolById('image-background-remover');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload your image file (JPG, PNG, WebP).",
    "Click the 'Remove Background (AI)' button.",
    "Wait for the AI to process your image. It will identify the main subject and replace the original background with plain white.",
    "Preview the processed image. The background should now be white.",
    "Download the resulting image."
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
      <ImageBackgroundRemoverClient />
    </ToolPageTemplate>
  );
}

    