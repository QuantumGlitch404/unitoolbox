
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { AudioToTextClient } from './audio-to-text-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';

export default function AudioToTextPage() {
  const tool = getToolById('audio-to-text');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload your audio file (e.g., MP3, WAV, M4A).",
    "Click the 'Transcribe Audio with AI' button.",
    "Wait for the AI to process the audio and generate the transcription.",
    "The transcribed text will appear in the output area below.",
    "You can then copy the transcribed text."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'AudioLines'}
      instructions={instructions}
    >
      <AdPlaceholder type="banner" className="mb-6" />
      <AudioToTextClient />
    </ToolPageTemplate>
  );
}

    