
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
    "The tool will use the color of the top-left pixel of your image as the target background color.",
    "Click the 'Remove Background' button.",
    "Pixels similar to the target background color will be made transparent.",
    "The processed image will be displayed with a checkerboard pattern for transparent areas. You can then download it."
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
