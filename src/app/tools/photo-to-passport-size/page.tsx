
import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { PhotoToPassportSizeClient } from './photo-to-passport-size-client';
import { Camera } from 'lucide-react';

export default function PhotoToPassportSizePage() {
  const tool = getToolById('photo-to-passport-size');

  if (!tool) {
    return <div>Tool not found: photo-to-passport-size</div>;
  }

  const instructions = [
    "Upload a clear, front-facing photo (JPG, PNG, WebP).",
    "Select the country preset for the desired passport photo dimensions.",
    "Choose a background color (typically white or light blue). This color is applied to the canvas; if your uploaded image is opaque (like a JPG), its own background will cover this. For images with transparency (like some PNGs), this color will show through.",
    "The tool will resize and crop your photo to the selected specifications, attempting to fill the dimensions.",
    "Ensure your face is centered and well-lit in the uploaded photo for best results.",
    "Download the generated passport-size photo as a JPG or PDF."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon || Camera}
      instructions={instructions}
    >
      <PhotoToPassportSizeClient />
    </ToolPageTemplate>
  );
}

    