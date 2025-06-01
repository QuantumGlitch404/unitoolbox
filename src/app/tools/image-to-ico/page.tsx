
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { ImageToIcoClient } from './image-to-ico-client';

export default function ImageToIcoPage() {
  const tool = getToolById('image-to-ico');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload an image (JPG, PNG, WebP).",
    "Select the desired icon size (e.g., 32x32, 48x48).",
    "Click the 'Convert to Icon' button.",
    "The image will be resized and converted to a PNG format.",
    "Download the resulting file, named with a .ico extension, suitable for basic icon use."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon}
      instructions={instructions}
    >
      <ImageToIcoClient />
    </ToolPageTemplate>
  );
}
