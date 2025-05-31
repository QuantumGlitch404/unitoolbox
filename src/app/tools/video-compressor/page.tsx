
import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { VideoCompressorClient } from './video-compressor-client';
import { FileVideo } from 'lucide-react';

export default function VideoCompressorPage() {
  const tool = getToolById('video-compressor');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload your video file (e.g., MP4, WebM, MOV).",
    "Select a resolution scale. Smaller scales process faster and result in smaller files, but reduce quality.",
    "Click the 'Re-encode Video' button.",
    "Wait for the re-encoding to complete. This can be slow for large videos.",
    "The tool will display original and new file sizes, and new dimensions.",
    "Download your re-encoded video. Audio preservation depends on browser capabilities and may not always work."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon || FileVideo}
      instructions={instructions}
    >
      <VideoCompressorClient />
    </ToolPageTemplate>
  );
}
