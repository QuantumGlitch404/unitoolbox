
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { PdfToImageClient } from './pdf-to-image-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('pdf-to-image');
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

export default function PdfToImagePage() {
  const tool = getToolById('pdf-to-image');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload your PDF file using the dropzone or file selector.",
    "Once the PDF is selected, click the 'Convert PDF to Images' button.",
    "The tool will process the PDF and render each page as an individual PNG image.",
    "Wait for the conversion to complete. Progress will be shown for larger PDFs.",
    "A preview and a download link will be provided for each generated page image (PNG format)."
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
      <PdfToImageClient />
    </ToolPageTemplate>
  );
}

    