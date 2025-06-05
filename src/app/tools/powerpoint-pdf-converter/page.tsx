
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { DocumentConverterClient } from '@/components/tools/document-converter-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('powerpoint-pdf-converter');
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

const conversionOptions = [
  {
    label: "PowerPoint (.pptx) to PDF",
    value: "pptx-to-pdf",
    sourceFormat: "pptx",
    targetFormat: "pdf",
    accept: { 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] },
    sourceIconName: "Presentation",
    targetIconName: "FileText",
  },
  {
    label: "PDF to PowerPoint (.pptx)",
    value: "pdf-to-pptx",
    sourceFormat: "pdf",
    targetFormat: "pptx",
    accept: { 'application/pdf': ['.pdf'] },
    sourceIconName: "FileText",
    targetIconName: "Presentation",
  }
];

export default function PowerPointPdfConverterPage() {
  const tool = getToolById('powerpoint-pdf-converter');

  if (!tool) {
    return <div>Tool not found: powerpoint-pdf-converter</div>;
  }

  const instructions = [
    "Choose your conversion type: 'PowerPoint (.pptx) to PDF' or 'PDF to PowerPoint (.pptx)'.",
    "Upload your PPTX or PDF file (max 25MB for client-side processing).",
    "Click the 'Convert File' button. The conversion happens in your browser.",
    "Wait for the process to complete. Progress will be updated.",
    "A download link for the converted file will be provided automatically.",
    "**PPTX to PDF Note**: This conversion primarily extracts text content from your .pptx slides and generates a text-based PDF. Images, shapes, colors, and complex layouts from the original PowerPoint are NOT preserved due to client-side limitations.",
    "**PDF to PPTX Note**: Each page of your PDF will be converted into a static, non-editable image. These images will then be placed onto individual slides in a new .pptx presentation. The content will not be editable as native PowerPoint elements (text, shapes, etc.)."
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
      <DocumentConverterClient
        toolName="powerpoint-pdf-converter"
        conversionOptions={conversionOptions}
        defaultConversionValue="pptx-to-pdf"
      />
    </ToolPageTemplate>
  );
}

    