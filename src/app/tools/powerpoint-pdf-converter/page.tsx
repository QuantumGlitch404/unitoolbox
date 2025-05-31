
import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { DocumentConverterClient } from '@/components/document-converter-client';
import { FileText, FilePresentation } from 'lucide-react';

const conversionOptions = [
  {
    label: "PowerPoint (.pptx) to PDF",
    value: "pptx-to-pdf",
    sourceFormat: "pptx",
    targetFormat: "pdf",
    accept: { 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] },
    sourceIcon: FilePresentation,
    targetIcon: FileText,
  },
  {
    label: "PDF to PowerPoint (.pptx)",
    value: "pdf-to-pptx",
    sourceFormat: "pdf",
    targetFormat: "pptx",
    accept: { 'application/pdf': ['.pdf'] },
    sourceIcon: FileText,
    targetIcon: FilePresentation,
  }
];

export default function PowerPointPdfConverterPage() {
  const tool = getToolById('powerpoint-pdf-converter');

  if (!tool) {
    return <div>Tool not found: powerpoint-pdf-converter</div>;
  }

  const instructions = [
    "Select the conversion direction (e.g., PowerPoint to PDF or PDF to PowerPoint).",
    `Upload your file (accepted types: ${conversionOptions.map(opt => Object.values(opt.accept).flat().join('/')).join(', ')}).`,
    "Click the 'Convert File' button.",
    "The system will simulate uploading and processing with a (hypothetical) backend Firebase Function.",
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
