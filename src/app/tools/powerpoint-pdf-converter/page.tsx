
import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { DocumentConverterClient } from '@/components/document-converter-client';

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
    "Select the conversion direction (e.g., PowerPoint to PDF or PDF to PowerPoint).",
    "Upload your file (PPTX or PDF). Max 25MB for client-side processing.",
    "Click the 'Convert File' button. The conversion happens directly in your browser.",
    "Once complete, a download link for the converted file will appear.",
    "PPTX to PDF: Extracts basic text content into a PDF; visuals, animations, and exact slide structure are generally lost.",
    "PDF to PPTX: Creates a .pptx presentation where each PDF page is converted into a static, non-editable image on a slide."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon}
      instructions={instructions}
    >
      <DocumentConverterClient
        toolName="powerpoint-pdf-converter"
        conversionOptions={conversionOptions}
        defaultConversionValue="pptx-to-pdf"
      />
    </ToolPageTemplate>
  );
}
