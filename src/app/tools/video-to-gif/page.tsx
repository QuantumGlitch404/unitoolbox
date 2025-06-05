
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { VideoToGifClient } from './video-to-gif-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('video-to-gif');
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

export default function VideoToGifPage() {
  const tool = getToolById('video-to-gif');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload your video file (e.g., MP4, WebM, MOV, AVI, MKV).",
    "Adjust settings like 'Start Time' and 'End Time' (in seconds) to select a portion of the video for the GIF (conceptual controls).",
    "Set the desired 'Frame Rate (fps)' for the GIF (conceptual control). Higher FPS means smoother animation but larger file size.",
    "Click the 'Convert to GIF' button.",
    "Wait for the conversion to complete (this is a simulated process for the current client-side version).",
    "A placeholder GIF will be displayed. You can then 'download' this placeholder.",
    "Note: True client-side video to GIF conversion is complex; this tool currently simulates the process and provides a placeholder result."
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
      <VideoToGifClient />
    </ToolPageTemplate>
  );
}

    