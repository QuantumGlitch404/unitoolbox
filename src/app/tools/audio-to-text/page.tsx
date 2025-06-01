
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { AudioToTextClient } from './audio-to-text-client';

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
      icon={tool.icon}
      instructions={instructions}
    >
      <AudioToTextClient />
    </ToolPageTemplate>
  );
}
