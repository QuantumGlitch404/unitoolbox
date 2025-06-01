
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { ImageToTextClient } from './image-to-text-client';

export default function ImageToTextPage() {
  const tool = getToolById('image-to-text');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload an image (JPG, PNG, WebP) containing text you want to extract.",
    "Click the 'Extract Text with AI' button.",
    "The AI will perform OCR (Optical Character Recognition) on the image.",
    "The extracted text will appear in the text area below, ready to be copied."
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
