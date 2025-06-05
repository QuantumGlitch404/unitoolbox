
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { VoiceNotesToTextClient } from './voice-notes-to-text-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('voice-notes-to-text');
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

export default function VoiceNotesToTextPage() {
  const tool = getToolById('voice-notes-to-text');

  if (!tool) {
    return <div>Tool not found: voice-notes-to-text</div>;
  }

  const instructions = [
    "Either upload an audio file (MP3, WAV, M4A, AAC, OGG, FLAC, WebM) or click 'Start Recording' to record audio directly in your browser using your microphone.",
    "If recording, click 'Stop Recording' when you're finished. An audio preview will become available.",
    "Once you have an audio source (uploaded or recorded), click the 'Transcribe & Format with AI' button.",
    "The AI will first transcribe the audio to raw text, then it will attempt to format this text with logical headings, paragraphs, and bullet points.",
    "Wait for both processing stages (transcribing and formatting) to complete. Progress will be indicated.",
    "Review the final formatted text in the output area. You can then copy it or download it as a TXT, DOCX, or PDF file.",
    "Note: The quality of AI transcription and formatting depends on audio clarity and content complexity."
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
      <VoiceNotesToTextClient />
    </ToolPageTemplate>
  );
}

    