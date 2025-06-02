
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { VoiceNotesToTextClient } from './voice-notes-to-text-client';
// ListVideo import not needed for default

export default function VoiceNotesToTextPage() {
  const tool = getToolById('voice-notes-to-text');

  if (!tool) {
    return <div>Tool not found: voice-notes-to-text</div>;
  }

  const instructions = [
    "Upload an audio file (MP3, WAV, etc.) or use the 'Start Recording' button to record audio directly in your browser.",
    "If recording, click 'Stop Recording' when done. A preview will be available.",
    "Click 'Transcribe & Format with AI'.",
    "The AI will transcribe the audio to text, then attempt to organize it with headings and bullet points.",
    "Review the formatted text. You can copy it or download it as TXT, DOCX, or PDF.",
    "Note: AI formatting quality may vary based on audio clarity and content complexity."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'ListVideo'}
      instructions={instructions}
    >
      <VoiceNotesToTextClient />
    </ToolPageTemplate>
  );
}

    