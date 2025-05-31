
import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { ImageBackgroundRemoverClient } from './image-background-remover-client';

export default function ImageBackgroundRemoverPage() {
  const tool = getToolById('image-background-remover');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload an image. For best results, choose one with a simple and fairly uniform background.",
    "This tool identifies the color of the **top-left pixel** of your image.",
    "Click 'Remove Background'. It will attempt to make pixels similar in color to the top-left pixel transparent.",
    "Effectiveness varies greatly based on background complexity and the top-left pixel color. This tool is not suitable for intricate or varied backgrounds.",
    "The processed image (with transparent areas on a checkerboard) can be downloaded."
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
