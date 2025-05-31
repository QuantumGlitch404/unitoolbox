
import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { ImageToTextClient } from './image-to-text-client';

export default function ImageToTextPage() {
  const tool = getToolById('image-to-text');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload an image containing text you want to extract.",
    "Click the 'Extract Text' button.",
    "The AI will perform OCR on the image (simulated).",
    "The extracted text will appear in the text area below."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon}
      instructions={instructions}
    >
      <ImageToTextClient />
    </ToolPageTemplate>
  );
}
