
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { PdfToImageClient } from './pdf-to-image-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';

export default function PdfToImagePage() {
  const tool = getToolById('pdf-to-image');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Upload your PDF file.",
    "The tool will process the PDF and render each page as an image.",
    "Wait for all pages to be converted. This might take time for large PDFs.",
    "A preview and download link will be provided for each page image (PNG format)."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'FileDown'}
      instructions={instructions}
    >
      <AdPlaceholder type="banner" className="mb-6" />
      <PdfToImageClient />
    </ToolPageTemplate>
  );
}

    