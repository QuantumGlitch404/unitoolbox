
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { TextToHandwritingClient } from './text-to-handwriting-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('text-to-handwriting');
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

export default function TextToHandwritingPage() {
  const tool = getToolById('text-to-handwriting');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Enter the text you want to convert into the 'Text to Convert' area. Use '\\n' for new lines if needed.",
    "Select a 'Font Style' from the dropdown menu. Available fonts will be loaded by your browser.",
    "Adjust the 'Font Size (px)' and 'Font Color' to your preference.",
    "Set the 'Image Width (px)' and 'Image Height (px)' for the output image.",
    "A live preview of your text on a canvas will update as you change settings.",
    "Click the 'Generate Handwriting Image' button.",
    "The text will be rendered as a PNG image, which you can then preview and download."
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
      <TextToHandwritingClient />
    </ToolPageTemplate>
  );
}

    