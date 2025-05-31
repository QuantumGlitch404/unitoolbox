
import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { VideoToGifClient } from './video-to-gif-client';

export default function VideoToGifPage() {
  const tool = getToolById('video-to-gif');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload your video file (e.g., MP4, WebM, MOV).",
    "Adjust settings like start/end time, frame rate, or dimensions (optional).",
    "Click the 'Convert to GIF' button.",
    "Wait for the conversion to complete.",
    "Preview and download your animated GIF."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon}
      instructions={instructions}
    >
      <VideoToGifClient />
    </ToolPageTemplate>
  );
}
