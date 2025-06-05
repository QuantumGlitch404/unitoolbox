
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { VideoCompressorClient } from './video-compressor-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('video-compressor');
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

export default function VideoCompressorPage() {
  const tool = getToolById('video-compressor');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload your video file (e.g., MP4, WebM, MOV, AVI, MKV).",
    "Select a 'Resolution Scale' from the dropdown. Smaller scales (e.g., 25%) process faster and result in much smaller files but will reduce video quality and dimensions. 'Original' will keep the same resolution but still re-encode.",
    "Click the 'Re-encode Video' button.",
    "Wait for the re-encoding process to complete. This can be time-consuming for large videos or high resolution scales as it happens in your browser.",
    "The tool will display original and new file sizes, the reduction percentage, and new video dimensions.",
    "Download your re-encoded video. Note: Audio track preservation depends on browser capabilities and the codecs used; it may not always be included in the output."
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
      <VideoCompressorClient />
    </ToolPageTemplate>
  );
}

    