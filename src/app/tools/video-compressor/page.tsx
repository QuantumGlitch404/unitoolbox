
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
    "Upload your video file (e.g., MP4, WebM).",
    "Adjust the (simulated) compression settings like quality or resolution.",
    "Click the 'Compress Video' button.",
    "Wait for the (simulated) compression to complete.",
    "The tool will display original and (simulated) new file sizes.",
    "Download your 'compressed' video (this will be the original file in this simulation)."
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
