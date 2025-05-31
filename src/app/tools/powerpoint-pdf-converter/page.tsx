
import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { DocumentConverterClient } from '@/components/document-converter-client';
// Icons are now handled by the client component via string names

const conversionOptions = [
  {
    label: "PowerPoint (.pptx) to PDF",
    value: "pptx-to-pdf",
    sourceFormat: "pptx",
    targetFormat: "pdf",
    accept: { 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] },
    sourceIconName: "FilePresentation",
    targetIconName: "FileText",
  },
  {
    label: "PDF to PowerPoint (.pptx)",
    value: "pdf-to-pptx",
    sourceFormat: "pdf",
    targetFormat: "pptx",
    accept: { 'application/pdf': ['.pdf'] },
    sourceIconName: "FileText",
    targetIconName: "FilePresentation",
  }
];

export default function PowerPointPdfConverterPage() {
  const tool = getToolById('powerpoint-pdf-converter');

  if (!tool) {
    return <div>Tool not found: powerpoint-pdf-converter</div>;
  }

  const instructions = [
    "Select the conversion direction (e.g., PowerPoint to PDF or PDF to PowerPoint).",
    `Upload your file.`,
    "Click the 'Convert File' button.",
    "The system will simulate uploading and processing.",
    "Once complete, a download link for the (placeholder) converted file will appear.",
    "Note: Actual conversion requires backend implementation."
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
