
import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { ImageBackgroundRemoverClient } from './image-background-remover-client';

export default function ImageBackgroundRemoverPage() {
  const tool = getToolById('image-background-remover');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload an image from which you want to remove the background.",
    "Click the 'Remove Background' button.",
    "The AI will process the image (simulated for now).",
    "The image with the background removed will be displayed, along with a download link."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon}
      instructions={instructions}
    >
      <ImageBackgroundRemoverClient />
    </ToolPageTemplate>
  );
}
