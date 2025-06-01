import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { ImageCompressorClient } from './image-compressor-client';
import { Scissors } from 'lucide-react'; // Placeholder, tool data has icon

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
      icon={tool.icon || Scissors}
      instructions={instructions}
    >
      <ImageCompressorClient />
    </ToolPageTemplate>
  );
}
