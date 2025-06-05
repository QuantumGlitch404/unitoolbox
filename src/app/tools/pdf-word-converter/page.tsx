
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { DocumentConverterClient } from '@/components/tools/document-converter-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('pdf-word-converter');
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
    label: "PDF to Word (.docx)",
    value: "pdf-to-docx",
    sourceFormat: "pdf",
    targetFormat: "docx",
    accept: { 'application/pdf': ['.pdf'] },
    sourceIconName: "FileText",
    targetIconName: "FileCode",
  },
  {
    label: "Word (.docx) to PDF",
    value: "docx-to-pdf",
    sourceFormat: "docx",
    targetFormat: "pdf",
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    sourceIconName: "FileCode",
    targetIconName: "FileText",
  }
];

export default function PdfWordConverterPage() {
  const tool = getToolById('pdf-word-converter');

  if (!tool) {
    return <div>Tool not found: pdf-word-converter</div>;
  }

  const instructions = [
    "Select the conversion direction: 'PDF to Word (.docx)' or 'Word (.docx) to PDF'.",
    "Upload your file (either PDF or DOCX, depending on your selection). There's a 25MB limit for client-side processing.",
    "Click the 'Convert File' button. The conversion process happens directly in your browser.",
    "Wait for the conversion to complete. Progress will be indicated.",
    "Once finished, a download link for the converted file will appear automatically.",
    "Note on PDF to Word: This conversion primarily extracts text and aims for basic paragraph structure. Complex formatting, images, and layouts from the PDF are generally not preserved perfectly.",
    "Note on Word to PDF: This conversion aims to preserve layout by rendering the DOCX content to HTML, then to an image, and finally into a PDF. Complex Word features might have variations."
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
        toolName="pdf-word-converter"
        conversionOptions={conversionOptions}
        defaultConversionValue="pdf-to-docx"
      />
    </ToolPageTemplate>
  );
}

    