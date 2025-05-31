
import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { ImageToPdfClient } from './image-to-pdf-client';

export default function ImageToPdfPage() {
  const tool = getToolById('image-to-pdf');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload one or more images (JPG, PNG).",
    "The images will be displayed in the order they were selected.",
    "Click the 'Convert to PDF' button.",
    "Each image will be placed on a separate page in the PDF, scaled to fit.",
    "Download your generated PDF file."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon}
      instructions={instructions}
    >
      <ImageToPdfClient />
    </ToolPageTemplate>
  );
}
