
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { AudioToTextClient } from './audio-to-text-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('audio-to-text');
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

export default function AudioToTextPage() {
  const tool = getToolById('audio-to-text');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload your audio file (e.g., MP3, WAV, M4A, AAC, OGG, FLAC) using the dropzone or file selector.",
    "Once the file is selected and a preview is shown (if applicable), click the 'Transcribe Audio with AI' button.",
    "Wait for the AI to process the audio. Progress will be indicated.",
    "The transcribed text will appear in the output area below.",
    "You can then copy the transcribed text using the 'Copy Text' button."
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
      <AudioToTextClient />
    </ToolPageTemplate>
  );
}

    