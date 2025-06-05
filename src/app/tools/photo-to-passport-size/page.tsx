
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { PhotoToPassportSizeClient } from './photo-to-passport-size-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('photo-to-passport-size');
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

export default function PhotoToPassportSizePage() {
  const tool = getToolById('photo-to-passport-size');

  if (!tool) {
    return <div>Tool not found: photo-to-passport-size</div>;
  }

  const instructions = [
    "Upload a clear, front-facing photo (JPG, PNG, WebP). Ensure good lighting and a neutral expression.",
    "Select the 'Country Size Preset' corresponding to the passport or visa photo requirements you need.",
    "Click the 'Generate Passport Photo' button.",
    "The tool will resize and crop your photo to the selected specifications. It will attempt to center the subject and apply a white background.",
    "Preview the generated photo. Ensure your face is correctly positioned and meets requirements.",
    "Download the generated passport-size photo as a JPG or PDF."
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
      <PhotoToPassportSizeClient />
    </ToolPageTemplate>
  );
}

    